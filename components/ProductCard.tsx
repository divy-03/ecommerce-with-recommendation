'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
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
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [tracked, setTracked] = useState(false);

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

  // Track view when component mounts
  useEffect(() => {
    if (session && !tracked) {
      trackInteraction('view');
      setTracked(true);
    }
  }, [session, tracked]);

  const handleLike = async () => {
    setLiked(!liked);
    await trackInteraction('like');
  };

  const handleClick = async () => {
    await trackInteraction('click');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          {session && (
            <button
              onClick={handleLike}
              className="text-2xl hover:scale-110 transition-transform"
            >
              {liked ? '❤️' : '🤍'}
            </button>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {product.category}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

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

