
import { ContentBasedRecommender } from './contentBased';
import { CollaborativeFilteringRecommender } from './collaborative';
import prisma from '../prisma';

export interface RecommendationWithDetails {
  productId: string;
  score: number;
  method: 'collaborative' | 'content-based' | 'hybrid' | 'popular';
  product?: any;
}

export class HybridRecommendationEngine {
  private contentBased: ContentBasedRecommender;
  private collaborative: CollaborativeFilteringRecommender;

  constructor() {
    this.contentBased = new ContentBasedRecommender();
    this.collaborative = new CollaborativeFilteringRecommender();
  }

  /**
   * Generate hybrid recommendations combining both approaches
   */
  async getRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationWithDetails[]> {
    try {
      console.log(`Hybrid engine: Generating recommendations for user ${userId}`);

      // Get recommendations from both engines
      const [contentBasedRecs, collaborativeRecs] = await Promise.all([
        this.contentBased.recommend(userId, limit * 2),
        this.collaborative.recommend(userId, limit * 2),
      ]);

      console.log(`Hybrid engine: Content-based=${contentBasedRecs.length}, Collaborative=${collaborativeRecs.length}`);

      // Combine and weight the results
      const combinedScores = new Map<string, { score: number; method: string }>();

      // Weight: 60% content-based, 40% collaborative
      contentBasedRecs.forEach((rec) => {
        combinedScores.set(rec.productId, {
          score: rec.score * 0.6,
          method: 'content-based',
        });
      });

      collaborativeRecs.forEach((rec) => {
        const existing = combinedScores.get(rec.productId);
        if (existing) {
          combinedScores.set(rec.productId, {
            score: existing.score + rec.score * 0.4,
            method: 'hybrid',
          });
        } else {
          combinedScores.set(rec.productId, {
            score: rec.score * 0.4,
            method: 'collaborative',
          });
        }
      });

      // If we have very few recommendations, add popular products
      if (combinedScores.size < limit) {
        console.log('Hybrid engine: Adding popular products as fallback');
        const popularProducts = await this.getPopularProducts(limit);
        
        popularProducts.forEach((rec) => {
          if (!combinedScores.has(rec.productId)) {
            combinedScores.set(rec.productId, {
              score: rec.score * 0.3, // Lower weight for popular items
              method: 'popular',
            });
          }
        });
      }

      // Sort and get top N
      const sortedRecommendations = Array.from(combinedScores.entries())
        .map(([productId, { score, method }]) => ({
          productId,
          score,
          method: method as any,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log(`Hybrid engine: Combined to ${sortedRecommendations.length} recommendations`);

      // Fetch product details
      const productIds = sortedRecommendations.map((r) => r.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      const finalRecommendations = sortedRecommendations
        .map((rec) => ({
          ...rec,
          product: productMap.get(rec.productId),
        }))
        .filter(rec => rec.product !== undefined);

      console.log(`Hybrid engine: Final ${finalRecommendations.length} recommendations with product details`);

      return finalRecommendations;
    } catch (error) {
      console.error('Hybrid engine error:', error);
      // Return popular products as final fallback
      return this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Get popular products as fallback
   */
  private async getPopularProducts(limit: number): Promise<{ productId: string; score: number }[]> {
    try {
      const productInteractionCounts = await prisma.userInteraction.groupBy({
        by: ['productId'],
        _count: {
          productId: true,
        },
        orderBy: {
          _count: {
            productId: 'desc',
          },
        },
        take: limit * 2,
      });

      return productInteractionCounts.map((item, index) => ({
        productId: item.productId,
        score: 100 - index * 3,
      }));
    } catch (error) {
      console.error('Error getting popular products:', error);
      return [];
    }
  }

  /**
   * Final fallback: Just get some products
   */
  private async getFallbackRecommendations(limit: number): Promise<RecommendationWithDetails[]> {
    try {
      const products = await prisma.product.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      return products.map((product, index) => ({
        productId: product.id,
        score: 100 - index * 5,
        method: 'popular' as const,
        product,
      }));
    } catch (error) {
      console.error('Error in fallback recommendations:', error);
      return [];
    }
  }

  /**
   * Get explanation for why a product was recommended
   */
  async getRecommendationExplanation(
    userId: string,
    productId: string
  ): Promise<string> {
    try {
      // Get user's interaction history
      const interactions = await prisma.userInteraction.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { timestamp: 'desc' },
        take: 20,
      });

      // Get recommended product
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return 'This product matches your interests.';
      }

      // Build explanation based on user history
      const reasons: string[] = [];

      // Check category match
      const categoryMatches = interactions.filter(
        (i) => i.product.category === product.category
      );
      if (categoryMatches.length > 0) {
        reasons.push(`you've browsed ${categoryMatches.length} ${product.category} products`);
      }

      // Check tag overlap
      const userTags = new Set(
        interactions.flatMap((i) => i.product.tags)
      );
      const matchingTags = product.tags.filter((tag) => userTags.has(tag));
      if (matchingTags.length > 0) {
        reasons.push(`matches your interest in ${matchingTags.slice(0, 2).join(' and ')}`);
      }

      // Check price range
      if (interactions.length > 0) {
        const prices = interactions.map(i => i.product.price);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const priceDiff = Math.abs(product.price - avgPrice);
        
        if (priceDiff < avgPrice * 0.3) {
          reasons.push(`priced similarly to products you like ($${product.price.toFixed(2)})`);
        }
      }

      if (reasons.length === 0) {
        return 'This is a popular product that matches your browsing patterns.';
      }

      return `Recommended because ${reasons.join(', ')}.`;
    } catch (error) {
      console.error('Error generating explanation:', error);
      return 'This product matches your interests.';
    }
  }
}

