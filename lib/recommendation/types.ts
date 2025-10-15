export interface UserInteractionData {
  userId: string;
  productId: string;
  interactionType: string;
  timestamp: Date;
}

export interface ProductWithScore {
  productId: string;
  score: number;
  reason: string;
}

export interface UserProfile {
  userId: string;
  preferredCategories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  favoriteTags: string[];
}

export interface RecommendationResult {
  productId: string;
  score: number;
  method: 'collaborative' | 'content-based' | 'hybrid';
  explanation?: string;
}
