'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalInteractions: number;
  breakdown: {
    views: number;
    likes: number;
    clicks: number;
  };
  topCategories: { category: string; count: number }[];
}

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
      <h2 className="text-xl font-semibold mb-4 text-white">Your Activity Summary</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/25 rounded-lg p-4 backdrop-blur-sm border border-white/30">
          <div className="text-3xl font-bold text-white">{stats.totalInteractions}</div>
          <div className="text-sm text-white/90 font-medium">Total Actions</div>
        </div>
        
        <div className="bg-white/25 rounded-lg p-4 backdrop-blur-sm border border-white/30">
          <div className="text-3xl font-bold text-white">{stats.breakdown.views}</div>
          <div className="text-sm text-white/90 font-medium">Products Viewed</div>
        </div>
        
        <div className="bg-white/25 rounded-lg p-4 backdrop-blur-sm border border-white/30">
          <div className="text-3xl font-bold text-white">{stats.breakdown.likes}</div>
          <div className="text-sm text-white/90 font-medium">Products Liked</div>
        </div>
        
        <div className="bg-white/25 rounded-lg p-4 backdrop-blur-sm border border-white/30">
          <div className="text-3xl font-bold text-white">{stats.breakdown.clicks}</div>
          <div className="text-sm text-white/90 font-medium">Products Clicked</div>
        </div>
      </div>

      {stats.topCategories.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3 text-white">
            Your Favorite Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.topCategories.map((cat) => (
              <span
                key={cat.category}
                className="bg-white/25 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-white/30 text-white font-medium"
              >
                {cat.category} ({cat.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

