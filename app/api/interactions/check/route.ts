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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type') || 'like';

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const interaction = await prisma.userInteraction.findFirst({
      where: {
        userId: session.user.id,
        productId,
        interactionType: type,
      },
    });

    return NextResponse.json({ exists: !!interaction });
  } catch (error) {
    console.error('Error checking interaction:', error);
    return NextResponse.json(
      { error: 'Failed to check interaction' },
      { status: 500 }
    );
  }
}
