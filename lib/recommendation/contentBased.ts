
import prisma from '../prisma';

interface Product {
  id: string;
  category: string;
  tags: string[];
  price: number;
}

interface UserPreferences {
  categories: Map<string, number>;
  tags: Map<string, number>;
  averagePrice: number;
}

export class ContentBasedRecommender {
  /**
   * Calculate content-based recommendations based on user's interaction history
   */
  async recommend(userId: string, limit: number = 10): Promise<{ productId: string; score: number }[]> {
    try {
      // Get user's interaction history
      const interactions = await prisma.userInteraction.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });

      console.log(`Content-based: Found ${interactions.length} interactions for user ${userId}`);

      if (interactions.length === 0) {
        console.log('Content-based: No interactions, returning popular products');
        return this.getPopularProducts(limit);
      }

      // Build user preference profile
      const userPreferences = this.buildUserProfile(interactions);

      // Get products user has clicked or liked (to exclude from recommendations)
      const stronglyInteractedProductIds = interactions
        .filter(i => ['click', 'like', 'purchase'].includes(i.interactionType))
        .map(i => i.productId);

      // Get all products (excluding only strongly interacted ones)
      const candidateProducts = await prisma.product.findMany({
        where: stronglyInteractedProductIds.length > 0 ? {
          id: { notIn: stronglyInteractedProductIds },
        } : {},
      });

      console.log(`Content-based: Found ${candidateProducts.length} candidate products (excluding ${stronglyInteractedProductIds.length} strongly interacted)`);

      if (candidateProducts.length === 0) {
        // If user has interacted with everything, get highest scoring products anyway
        console.log('Content-based: No candidates, getting all products');
        const allProducts = await prisma.product.findMany();
        
        const scoredProducts = allProducts.map((product) => ({
          productId: product.id,
          score: this.calculateSimilarityScore(product, userPreferences),
        }));

        return scoredProducts
          .filter(p => p.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      }

      // Calculate similarity scores
      const scoredProducts = candidateProducts.map((product) => ({
        productId: product.id,
        score: this.calculateSimilarityScore(product, userPreferences),
      }));

      // Sort by score and return top N
      const topRecommendations = scoredProducts
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log(`Content-based: Returning ${topRecommendations.length} recommendations`);

      return topRecommendations;
    } catch (error) {
      console.error('Content-based recommender error:', error);
      return [];
    }
  }

  /**
   * Build user preference profile from interaction history
   */
  private buildUserProfile(interactions: any[]): UserPreferences {
    const categories = new Map<string, number>();
    const tags = new Map<string, number>();
    let totalPrice = 0;
    let totalWeight = 0;

    // Weight different interaction types
    const weights: Record<string, number> = {
      purchase: 5,
      like: 3,
      click: 2,
      view: 1,
    };

    interactions.forEach((interaction) => {
      const weight = weights[interaction.interactionType] || 1;
      const product = interaction.product;

      // Aggregate category preferences
      const categoryCount = categories.get(product.category) || 0;
      categories.set(product.category, categoryCount + weight);

      // Aggregate tag preferences
      product.tags.forEach((tag: string) => {
        const tagCount = tags.get(tag) || 0;
        tags.set(tag, tagCount + weight);
      });

      totalPrice += product.price * weight;
      totalWeight += weight;
    });

    const averagePrice = totalWeight > 0 ? totalPrice / totalWeight : 0;

    return { categories, tags, averagePrice };
  }

  /**
   * Calculate similarity score between product and user preferences
   */
  private calculateSimilarityScore(product: Product, preferences: UserPreferences): number {
    let score = 0;

    // Category match (40% weight)
    const categoryScore = preferences.categories.get(product.category) || 0;
    score += categoryScore * 0.4;

    // Tag overlap (40% weight)
    let tagScore = 0;
    product.tags.forEach((tag) => {
      tagScore += preferences.tags.get(tag) || 0;
    });
    score += tagScore * 0.4;

    // Price similarity (20% weight)
    if (preferences.averagePrice > 0) {
      const priceDiff = Math.abs(product.price - preferences.averagePrice);
      const priceScore = Math.max(0, 100 - priceDiff / 2);
      score += priceScore * 0.2;
    }

    return score;
  }

  /**
   * Fallback: Get popular products for cold start
   */
  private async getPopularProducts(limit: number): Promise<{ productId: string; score: number }[]> {
    try {
      // Get products with most interactions
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
        take: limit,
      });

      console.log(`Popular products: Found ${productInteractionCounts.length} products`);

      if (productInteractionCounts.length === 0) {
        // If no interactions at all, just get recent products
        const randomProducts = await prisma.product.findMany({
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        });

        return randomProducts.map((p, index) => ({
          productId: p.id,
          score: 100 - index * 5,
        }));
      }

      return productInteractionCounts.map((item, index) => ({
        productId: item.productId,
        score: 100 - index * 5,
      }));
    } catch (error) {
      console.error('Error getting popular products:', error);
      return [];
    }
  }
}

