import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { HybridRecommendationEngine } from '@/lib/recommendation/hybridEngine';

const recommendationEngine = new HybridRecommendationEngine();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Generating recommendations for user:', session.user.id);

    const recommendations = await recommendationEngine.getRecommendations(
      session.user.id,
      limit
    );

    console.log('Generated recommendations count:', recommendations.length);

    // Add explanations to each recommendation
    const recommendationsWithExplanations = await Promise.all(
      recommendations.map(async (rec) => {
        const explanation = await recommendationEngine.getRecommendationExplanation(
          session.user.id,
          rec.productId
        );
        
        return {
          ...rec,
          explanation,
        };
      })
    );

    console.log('Final recommendations:', recommendationsWithExplanations.length);

    return NextResponse.json({
      recommendations: recommendationsWithExplanations,
      userId: session.user.id,
      generatedAt: new Date().toISOString(),
    });
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

