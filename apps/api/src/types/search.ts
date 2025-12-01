import { Prisma } from "../../generated/prisma/index.js";

export interface SearchFilters {
  genres?: string[];
  year?: number;
}

export interface SearchResult {
  id: number;
  title: string;
  description: string | null;
  posterPath: string | null;
  releaseDate: Date | null;
  genres: string[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  genres: string[];
  years: number[];
}

export type SortBy = "rating" | "reviews" | "year" | "title";

// Prisma where clause type for Show
export type ShowWhereInput = Prisma.ShowWhereInput;

// Prisma orderBy type for Show
export type ShowOrderByInput = Prisma.ShowOrderByWithRelationInput;
