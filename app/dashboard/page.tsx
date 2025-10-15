'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import StatsPanel from '@/components/StatsPanel';

interface Recommendation {
  productId: string;
  score: number;
  method: string;
  explanation: string;
  product: any;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchRecommendations();
    }
  }, [status, router]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching recommendations...');
      
      const res = await fetch('/api/recommendations?limit=12');
      const data = await res.json();
      
      console.log('Recommendations response:', data);
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }
      
      setRecommendations(data.recommendations || []);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      setError(error.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetch('/api/recommendations/refresh', { method: 'POST' });
      await fetchRecommendations();
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Personalized Recommendations
            </h1>
            <p className="text-gray-600 mt-2">
              Based on your browsing history and preferences
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      <StatsPanel />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading recommendations</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Debug Info - Remove in production */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Debug Info:</strong> Found {recommendations.length} recommendations
        </p>
      </div>

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Recommendations Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start browsing products to get personalized recommendations!
          </p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Recommended Products Grid */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recommended For You ({recommendations.length} items)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <div key={rec.productId} className="relative">
                  <ProductCard product={rec.product} />
                  
                  {/* Recommendation Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {Math.round(rec.score)}% Match
                    </span>
                  </div>

                  {/* Explanation Tooltip */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-900">
                      <span className="font-semibold">💡 Why? </span>
                      {rec.explanation}
                    </p>
                    <span className="text-xs text-blue-600 mt-1 inline-block font-medium">
                      Method: {rec.method}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

