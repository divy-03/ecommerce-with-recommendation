'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchInteractions();
    }
  }, [status, router]);

  const fetchInteractions = async () => {
    try {
      const res = await fetch('/api/interactions');
      const data = await res.json();
      setInteractions(data);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Your Activity Dashboard
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Interactions</h2>
        {interactions.length === 0 ? (
          <p className="text-gray-600">
            No interactions yet. Start browsing products to get personalized
            recommendations!
          </p>
        ) : (
          <div className="space-y-3">
            {interactions.slice(0, 10).map((interaction) => (
              <div
                key={interaction.id}
                className="flex items-center justify-between border-b pb-3"
              >
                <div>
                  <p className="font-medium">{interaction.product.name}</p>
                  <p className="text-sm text-gray-600">
                    {interaction.product.category}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {interaction.interactionType}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(interaction.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">
          Personalized Recommendations Coming Soon!
        </h2>
        <p className="text-blue-100 mb-4">
          We're analyzing your preferences to provide tailored product
          recommendations with AI-powered explanations.
        </p>
        <p className="text-sm text-blue-200">
          Phase 2: Recommendation engine implementation in progress...
        </p>
      </div>
    </div>
  );
}
