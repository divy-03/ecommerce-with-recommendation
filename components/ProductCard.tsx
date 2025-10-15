
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  tags: string[];
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
  isRecommendation?: boolean;
  recommendationScore?: number;
  recommendationMethod?: string;
  aiExplanation?: string;
}

export default function ProductCard({ 
  product, 
  isRecommendation = false,
  recommendationScore,
  recommendationMethod,
  aiExplanation 
}: ProductCardProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Check if product is liked on mount
  useEffect(() => {
    if (session?.user?.id) {
      checkIfLiked();
    }
  }, [session?.user?.id, product.id]);

  const checkIfLiked = async () => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch(`/api/interactions/check?productId=${product.id}&type=like`);
      if (res.ok) {
        const data = await res.json();
        setLiked(data.exists);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const trackInteraction = async (type: string) => {
    if (!session) return;

    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          interactionType: type,
        }),
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  // Track view when component mounts (only for non-recommendation context)
  useEffect(() => {
    if (session && !tracked && !isRecommendation) {
      trackInteraction('view');
      setTracked(true);
    }
  }, [session, tracked, isRecommendation]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session || loadingLike) return;

    setLoadingLike(true);
    const newLikedState = !liked;
    setLiked(newLikedState);

    try {
      if (newLikedState) {
        await fetch('/api/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            interactionType: 'like',
          }),
        });
      } else {
        await fetch('/api/interactions/unlike', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
          }),
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setLiked(!newLikedState);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleClick = async () => {
    await trackInteraction('click');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      {/* Recommendation Badge */}
      {isRecommendation && recommendationScore !== undefined && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {Math.round(recommendationScore)}% Match
          </div>
        </div>
      )}

      {/* Product Image - Simple img tag */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
            {product.name}
          </h3>
          {session && (
            <button
              onClick={handleLike}
              disabled={loadingLike}
              className={`text-2xl hover:scale-110 transition-transform ml-2 flex-shrink-0 ${loadingLike ? 'opacity-50' : ''}`}
            >
              {liked ? '❤️' : '🤍'}
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">
            {product.category}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* AI Explanation Section (Only for recommendations) */}
        {isRecommendation && aiExplanation && (
          <div className="mt-3 border-t pt-3">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full flex items-center justify-between text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Why recommended?
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${showExplanation ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Expandable Explanation */}
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                showExplanation ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">🤖</span>
                  <div className="flex-1">
                    <p className="text-xs text-blue-900 leading-relaxed">
                      {aiExplanation}
                    </p>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-200">
                      <span className="text-xs text-blue-600 font-medium">
                        AI Powered
                      </span>
                      {recommendationMethod && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600 capitalize">
                            {recommendationMethod.replace('-', ' ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleClick}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

