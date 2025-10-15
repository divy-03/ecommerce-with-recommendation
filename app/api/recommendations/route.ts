import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { HybridRecommendationEngine } from '@/lib/recommendation/hybridEngine';
import { explanationGenerator } from '@/lib/ai/explanationGenerator';
import { cacheManager } from '@/lib/cache/cacheManager';

const recommendationEngine = new HybridRecommendationEngine();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const skipCache = searchParams.get('skipCache') === 'true';

    console.log('Generating recommendations for user:', session.user.id);

    // Check cache first
    const cacheKey = `recommendations:${session.user.id}:${limit}`;
    
    if (!skipCache) {
      const cached = await cacheManager.get<any>(cacheKey);
      if (cached) {
        console.log('Returning cached recommendations');
        return NextResponse.json({
          ...cached,
          fromCache: true,
        });
      }
    }

    // Generate fresh recommendations
    const recommendations = await recommendationEngine.getRecommendations(
      session.user.id,
      limit
    );

    console.log('Generated recommendations count:', recommendations.length);

    // Batch generate AI explanations
    const explanations = await explanationGenerator.batchGenerateExplanations(
      session.user.id,
      recommendations
    );

    // Add explanations to recommendations
    const recommendationsWithExplanations = recommendations.map((rec) => ({
      ...rec,
      explanation: explanations.get(rec.productId) || 'Recommended based on your preferences.',
    }));

    const response = {
      recommendations: recommendationsWithExplanations,
      userId: session.user.id,
      generatedAt: new Date().toISOString(),
      cacheStatus: cacheManager.getStatus(),
    };

    // Cache for 30 minutes
    await cacheManager.set(cacheKey, response, 1800);

    console.log('Final recommendations:', recommendationsWithExplanations.length);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

