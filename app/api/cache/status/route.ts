import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache/cacheManager';
import { geminiClient } from '@/lib/ai/gemini';

export async function GET(request: NextRequest) {
  const status = {
    cache: cacheManager.getStatus(),
    ai: {
      gemini: geminiClient.isAvailable(),
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(status);
}
