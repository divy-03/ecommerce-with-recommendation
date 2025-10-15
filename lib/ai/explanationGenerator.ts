import { geminiClient } from './gemini';
import { cacheManager } from '../cache/cacheManager';
import prisma from '../prisma';

interface RecommendationContext {
  userId: string;
  productId: string;
  productName: string;
  productCategory: string;
  productPrice: number;
  productTags: string[];
  recommendationMethod: string;
  recommendationScore: number;
}

export class ExplanationGenerator {
  /**
   * Generate AI-powered explanation for a recommendation
   */
  async generateExplanation(context: RecommendationContext): Promise<string> {
    // Check cache first
    const cacheKey = `explanation:${context.userId}:${context.productId}`;
    const cached = await cacheManager.get<string>(cacheKey);
    
    if (cached) {
      console.log('Using cached explanation');
      return cached;
    }

    // Get user interaction history
    const userHistory = await this.getUserHistory(context.userId);

    // Generate explanation
    let explanation: string;

    if (geminiClient.isAvailable()) {
      try {
        explanation = await this.generateWithGemini(context, userHistory);
      } catch (error) {
        console.error('Gemini generation failed, using fallback:', error);
        explanation = this.generateFallbackExplanation(context, userHistory);
      }
    } else {
      explanation = this.generateFallbackExplanation(context, userHistory);
    }

    // Cache for 1 hour
    await cacheManager.set(cacheKey, explanation, 3600);

    return explanation;
  }

  /**
   * Generate explanation using Gemini AI
   */
  private async generateWithGemini(
    context: RecommendationContext,
    userHistory: any
  ): Promise<string> {
    const prompt = this.buildPrompt(context, userHistory);
    
    console.log('Generating explanation with Gemini AI...');
    const response = await geminiClient.generateText(prompt);
    
    // Clean up the response
    return response.trim();
  }

  /**
   * Build prompt for Gemini
   */
  private buildPrompt(context: RecommendationContext, userHistory: any): string {
    const { topCategories, topTags, averagePrice, totalInteractions } = userHistory;

    return `You are a personalized shopping assistant. Generate a concise, friendly explanation (2-3 sentences max) for why we're recommending this product to the user.

Product Details:
- Name: ${context.productName}
- Category: ${context.productCategory}
- Price: $${context.productPrice.toFixed(2)}
- Tags: ${context.productTags.join(', ')}

User Shopping Pattern:
- Favorite Categories: ${topCategories.map((c: any) => c.category).join(', ')}
- Interested in Tags: ${topTags.slice(0, 5).join(', ')}
- Average Purchase Price: $${averagePrice.toFixed(2)}
- Total Interactions: ${totalInteractions}

Recommendation Method: ${context.recommendationMethod}
Match Score: ${Math.round(context.recommendationScore)}%

Write a natural, personalized explanation starting with "We think you'll love this because" or similar. Focus on the connection between their shopping behavior and this product. Be warm and conversational.`;
  }

  /**
   * Fallback explanation when Gemini is unavailable
   */
  private generateFallbackExplanation(
    context: RecommendationContext,
    userHistory: any
  ): string {
    const { topCategories, topTags, averagePrice } = userHistory;
    const reasons: string[] = [];

    // Category match
    const matchingCategory = topCategories.find(
      (c: any) => c.category === context.productCategory
    );
    if (matchingCategory) {
      reasons.push(`you've shown strong interest in ${context.productCategory} products`);
    }

    // Tag match
    const matchingTags = context.productTags.filter((tag) =>
      topTags.includes(tag)
    );
    if (matchingTags.length > 0) {
      reasons.push(`it features ${matchingTags.slice(0, 2).join(' and ')} that you like`);
    }

    // Price match
    const priceDiff = Math.abs(context.productPrice - averagePrice);
    if (priceDiff < averagePrice * 0.3) {
      reasons.push(`it's within your preferred price range ($${context.productPrice.toFixed(2)})`);
    }

    // Match score
    if (context.recommendationScore > 80) {
      reasons.push(`it's a ${Math.round(context.recommendationScore)}% match for your preferences`);
    }

    if (reasons.length === 0) {
      return `We think you'll love this ${context.productCategory} product based on your browsing history!`;
    }

    return `We recommend this because ${reasons.join(', ')}.`;
  }

  /**
   * Get user shopping history summary
   */
  private async getUserHistory(userId: string) {
    const cacheKey = `user_history:${userId}`;
    const cached = await cacheManager.get<any>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const interactions = await prisma.userInteraction.findMany({
      where: { userId },
      include: { product: true },
      take: 100,
    });

    // Aggregate categories
    const categoryCount = new Map<string, number>();
    interactions.forEach((i) => {
      const category = i.product.category;
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    const topCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    // Aggregate tags
    const tagCount = new Map<string, number>();
    interactions.forEach((i) => {
      i.product.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    // Calculate average price
    const totalPrice = interactions.reduce((sum, i) => sum + i.product.price, 0);
    const averagePrice = interactions.length > 0 ? totalPrice / interactions.length : 0;

    const summary = {
      topCategories,
      topTags,
      averagePrice,
      totalInteractions: interactions.length,
    };

    // Cache for 10 minutes
    await cacheManager.set(cacheKey, summary, 600);

    return summary;
  }

  /**
   * Batch generate explanations for multiple recommendations
   */
  async batchGenerateExplanations(
    userId: string,
    recommendations: Array<{
      productId: string;
      score: number;
      method: string;
      product: any;
    }>
  ): Promise<Map<string, string>> {
    const explanations = new Map<string, string>();

    // Process in parallel with limit
    const batchSize = 3;
    for (let i = 0; i < recommendations.length; i += batchSize) {
      const batch = recommendations.slice(i, i + batchSize);
      
      const promises = batch.map(async (rec) => {
        const context: RecommendationContext = {
          userId,
          productId: rec.productId,
          productName: rec.product.name,
          productCategory: rec.product.category,
          productPrice: rec.product.price,
          productTags: rec.product.tags,
          recommendationMethod: rec.method,
          recommendationScore: rec.score,
        };

        const explanation = await this.generateExplanation(context);
        return { productId: rec.productId, explanation };
      });

      const results = await Promise.all(promises);
      results.forEach(({ productId, explanation }) => {
        explanations.set(productId, explanation);
      });
    }

    return explanations;
  }
}

export const explanationGenerator = new ExplanationGenerator();
