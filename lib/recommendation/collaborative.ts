
import prisma from '../prisma';

interface UserSimilarity {
  userId: string;
  similarityScore: number;
}

export class CollaborativeFilteringRecommender {
  /**
   * Calculate collaborative filtering recommendations
   */
  async recommend(userId: string, limit: number = 10): Promise<{ productId: string; score: number }[]> {
    try {
      // Find similar users
      const similarUsers = await this.findSimilarUsers(userId, 20);

      console.log(`Collaborative: Found ${similarUsers.length} similar users`);

      if (similarUsers.length === 0) {
        console.log('Collaborative: No similar users found');
        return [];
      }

      // Get products liked by similar users
      const recommendations = await this.getRecommendationsFromSimilarUsers(
        userId,
        similarUsers,
        limit
      );

      console.log(`Collaborative: Generated ${recommendations.length} recommendations`);

      return recommendations;
    } catch (error) {
      console.error('Collaborative filtering error:', error);
      return [];
    }
  }

  /**
   * Find users with similar interaction patterns
   */
  private async findSimilarUsers(userId: string, limit: number): Promise<UserSimilarity[]> {
    try {
      // Get current user's interactions
      const userInteractions = await prisma.userInteraction.findMany({
        where: { userId },
        select: { productId: true, interactionType: true },
      });

      if (userInteractions.length === 0) {
        return [];
      }

      const userProductIds = new Set(userInteractions.map((i) => i.productId));

      // Get all other users who interacted with same products
      const otherUsersInteractions = await prisma.userInteraction.findMany({
        where: {
          productId: { in: Array.from(userProductIds) },
          userId: { not: userId },
        },
        select: {
          userId: true,
          productId: true,
          interactionType: true,
        },
      });

      // Group by user
      const userInteractionsMap = new Map<string, Set<string>>();
      
      otherUsersInteractions.forEach((interaction) => {
        if (!userInteractionsMap.has(interaction.userId)) {
          userInteractionsMap.set(interaction.userId, new Set());
        }
        userInteractionsMap.get(interaction.userId)!.add(interaction.productId);
      });

      // Calculate similarity scores
      const similarities: UserSimilarity[] = [];

      for (const [otherUserId, otherProductIds] of userInteractionsMap) {
        // Jaccard similarity: intersection / union
        const intersection = new Set(
          Array.from(userProductIds).filter((id) => otherProductIds.has(id))
        );
        const union = new Set([...userProductIds, ...otherProductIds]);

        const similarity = intersection.size / union.size;

        if (similarity > 0.05) {
          // Lower threshold to find more similar users
          similarities.push({
            userId: otherUserId,
            similarityScore: similarity,
          });
        }
      }

      return similarities
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding similar users:', error);
      return [];
    }
  }

  /**
   * Get product recommendations from similar users
   */
  private async getRecommendationsFromSimilarUsers(
    userId: string,
    similarUsers: UserSimilarity[],
    limit: number
  ): Promise<{ productId: string; score: number }[]> {
    try {
      // Get products current user has strongly interacted with (click, like, purchase)
      const userStrongInteractions = await prisma.userInteraction.findMany({
        where: { 
          userId,
          interactionType: { in: ['click', 'like', 'purchase'] }
        },
        select: { productId: true },
      });

      const userStrongProductIds = new Set(userStrongInteractions.map((i) => i.productId));

      // Get interactions from similar users
      const similarUserIds = similarUsers.map((u) => u.userId);
      const similarUsersInteractions = await prisma.userInteraction.findMany({
        where: {
          userId: { in: similarUserIds },
        },
        select: {
          userId: true,
          productId: true,
          interactionType: true,
        },
      });

      // Weight interactions by user similarity and interaction type
      const productScores = new Map<string, number>();
      const interactionWeights: Record<string, number> = {
        purchase: 5,
        like: 3,
        click: 2,
        view: 1,
      };

      similarUsersInteractions.forEach((interaction) => {
        // Skip if user already strongly interacted with this product
        if (userStrongProductIds.has(interaction.productId)) {
          return;
        }

        const userSimilarity =
          similarUsers.find((u) => u.userId === interaction.userId)?.similarityScore || 0;
        const interactionWeight = interactionWeights[interaction.interactionType] || 1;

        const score = userSimilarity * interactionWeight * 100;
        const currentScore = productScores.get(interaction.productId) || 0;
        productScores.set(interaction.productId, currentScore + score);
      });

      // Convert to array and sort
      const recommendations = Array.from(productScores.entries())
        .map(([productId, score]) => ({ productId, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations from similar users:', error);
      return [];
    }
  }
}

