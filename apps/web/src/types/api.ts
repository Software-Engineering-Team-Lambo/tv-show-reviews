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
  createdAt: string
  updatedAt: string
  username?: string
  date?: string
  reviewText?: string
  likes?: number
}

// Search API types
export interface SearchRequestBody {
  query?: string
  genres?: string[]
  year?: number
  sortBy?: 'rating' | 'reviews' | 'year' | 'title'
}

export interface SearchResult {
  id: number
  title: string
  description: string | null
  releaseDate: string | null
  genres: string[]
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
  posterPath: string | null
}

export interface HomePageShow {
  id: number
  title: string
  description: string | null
  releaseDate: string | null
  genres: string[]
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
  posterPath: string | null
}

export interface HomePageResponse {
  popularShows: HomePageShow[]
  newReleases: HomePageShow[]
  genres: Genre[]
}

export interface FilterOptions {
  genres: string[]
  years: number[]
}

// Extended types for frontend display
export interface ShowWithDetails {
  id: number
  title: string
  year: number | null
  description: string | null
  seasons: number | null
  status: string | null
  posterPath: string | null
  createdAt: string
  updatedAt: string
  genres: string[] // Array of genre names from API
  cast: string[] // Array of actor names from API
  creators: string[] // Array of creator names from API
  reviews: Review[]
  averageRating: number
  reviewCount: number
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
