import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user statistics
    const [
      totalInteractions,
      viewCount,
      likeCount,
      clickCount,
      topCategories,
      recentActivity,
    ] = await Promise.all([
      prisma.userInteraction.count({ where: { userId } }),
      prisma.userInteraction.count({
        where: { userId, interactionType: 'view' },
      }),
      prisma.userInteraction.count({
        where: { userId, interactionType: 'like' },
      }),
      prisma.userInteraction.count({
        where: { userId, interactionType: 'click' },
      }),
      prisma.userInteraction.findMany({
        where: { userId },
        include: { product: true },
        take: 100,
      }),
      prisma.userInteraction.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { timestamp: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate top categories
    const categoryCount = new Map<string, number>();
    topCategories.forEach((interaction) => {
      const category = interaction.product.category;
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    const topCategoriesArray = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    return NextResponse.json({
      totalInteractions,
      breakdown: {
        views: viewCount,
        likes: likeCount,
        clicks: clickCount,
      },
      topCategories: topCategoriesArray,
      recentActivity: recentActivity.map((activity) => ({
        productName: activity.product.name,
        type: activity.interactionType,
        timestamp: activity.timestamp,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
