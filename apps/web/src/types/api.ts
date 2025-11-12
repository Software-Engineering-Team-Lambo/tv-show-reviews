// Types that match the backend Prisma schema
// These should be kept in sync with the API responses

export interface Show {
  id: number
  title: string
  year: number | null
  description: string | null
  seasons: number | null
  status: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Genre {
  id: number
  name: string
}

export interface ShowGenre {
  showId: number
  genreId: number
  genre?: Genre
}

export interface Actor {
  id: number
  name: string
  createdAt: Date
}

export interface ShowCast {
  showId: number
  actorId: number
  actor?: Actor
  role: string | null
  order: number | null
}

export interface Review {
  id: number
  rating: number
  comment: string | null
  userId: number
  showId: number
  createdAt: Date
  updatedAt: Date
}

// Extended types for frontend display
export interface ShowWithDetails extends Show {
  genres?: ShowGenre[]
  cast?: ShowCast[]
  reviews?: Review[]
  averageRating?: number
  reviewCount?: number
}

// Type for display in cards and lists
export interface ShowCardData {
  id: number
  title: string
  year: number | null
  description: string | null
  image?: string // Optional - may need to be added to backend
  rating: number // Average rating
  reviews: number // Review count
  genre: string[] // Array of genre names for display
}

// API Response types
export interface SearchResponse {
  id: number
  title: string
  year: number | null
  description: string | null
  seasons: number | null
  status: string | null
  createdAt: string
  updatedAt: string
}
