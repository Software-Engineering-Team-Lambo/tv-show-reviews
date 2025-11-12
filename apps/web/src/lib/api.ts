import type { SearchResponse, ShowCardData, ShowWithDetails } from '@/types/api'

/**
 * Transform a raw API search response into ShowCardData format for display
 * @param show - Raw show data from the API
 * @returns Formatted show data for card display
 */
export function transformToShowCard(show: SearchResponse): ShowCardData {
  return {
    id: show.id,
    title: show.title,
    description: show.description,
    year: show.year,
    genre: [], // TODO: Extract from show.genres when API includes relations
    image: undefined, // TODO: Add image field to backend schema
    rating: 0, // TODO: Calculate average from show.reviews when API includes relations
    reviews: 0, // TODO: Get count from show.reviews when API includes relations
  }
}

/**
 * Transform a show with all details (including relations) into ShowCardData
 * @param show - Show with included relations
 * @returns Formatted show data for card display
 */
export function transformShowWithDetails(show: ShowWithDetails): ShowCardData {
  const genres = show.genres?.map((sg) => sg.genre?.name).filter(Boolean) || []
  const averageRating = show.averageRating || 0
  const reviewCount = show.reviewCount || show.reviews?.length || 0

  return {
    id: show.id,
    title: show.title,
    description: show.description,
    year: show.year,
    genre: genres as string[],
    image: undefined, // TODO: Add image field to backend schema
    rating: averageRating,
    reviews: reviewCount,
  }
}
