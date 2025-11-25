/**
 * API Response types for Show endpoints
 */

export interface ShowReview {
  id: number;
  userId: number;
  username: string;
  rating: number;
  comment: string | null;
  reviewText: string | null;
  createdAt: string;
  updatedAt: string;
  date: string;
  showId: number;
  likes: number;
}

export interface ShowDetailsResponse {
  id: number;
  title: string;
  year: number | null;
  description: string | null;
  seasons: number | null;
  status: string | null;
  posterPath: string | null;
  genres: string[];
  cast: string[];
  creators: string[];
  averageRating: number;
  reviewCount: number;
  reviews: ShowReview[];
}
