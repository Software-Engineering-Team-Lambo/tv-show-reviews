/**
 * API Response types for Show endpoints
 */

export interface ShowReview {
  id: number;
  userId: number;
  username: string;
  rating: number;
  reviewText: string | null;
  date: string;
}

export interface ShowDetailsResponse {
  id: number;
  title: string;
  year: number | null;
  description: string | null;
  seasons: number | null;
  status: string | null;
  posterPath: string | null;
  image: string | null;
  genres: string[];
  cast: string[];
  creators: string[];
  rating: number;
  totalReviews: number;
  reviews: ShowReview[];
}
