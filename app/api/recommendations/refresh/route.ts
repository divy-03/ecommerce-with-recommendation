import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { HybridRecommendationEngine } from '@/lib/recommendation/hybridEngine';

const recommendationEngine = new HybridRecommendationEngine();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate fresh recommendations
    const recommendations = await recommendationEngine.getRecommendations(
      session.user.id,
      10
    );

    return NextResponse.json({
      message: 'Recommendations refreshed',
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('Error refreshing recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to refresh recommendations' },
      { status: 500 }
    );
  }
}
