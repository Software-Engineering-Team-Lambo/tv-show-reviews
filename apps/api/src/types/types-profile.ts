import { Prisma, Show } from "../../generated/prisma";

// Tab types for pagination
export type ProfileTab = "reviews" | "favorites" | "watchlist";

// Prisma include configurations
export const reviewWithShowInclude = {
  show: true,
} satisfies Prisma.ReviewInclude;
export const favoriteWithShowInclude = {
  show: true,
} satisfies Prisma.FavoriteInclude;
export const watchlistWithShowInclude = {
  show: true,
} satisfies Prisma.WatchlistInclude;

// Derived types from Prisma with included relations
export type ReviewWithShow = Prisma.ReviewGetPayload<{
  include: typeof reviewWithShowInclude;
}>;
export type FavoriteWithShow = Prisma.FavoriteGetPayload<{
  include: typeof favoriteWithShowInclude;
}>;
export type WatchlistWithShow = Prisma.WatchlistGetPayload<{
  include: typeof watchlistWithShowInclude;
}>;

// Public watchlist item (without private notes)
export interface PublicWatchlistItem {
  id: number;
  addedAt: Date;
  show: Show;
}

// Pagination info for each tab
export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

// Base user info (shared fields)
export interface BaseUserInfo {
  id: number;
  username: string;
  createdAt: Date;
}

// Own profile user (includes email)
export interface ProfileUser extends BaseUserInfo {
  email: string;
  reviews: ReviewWithShow[];
  favorites: FavoriteWithShow[];
  watchlist: WatchlistWithShow[];
}

// Public profile user (no email, no private notes on watchlist)
export interface PublicProfileUser extends BaseUserInfo {
  reviews: ReviewWithShow[];
  favorites: FavoriteWithShow[];
  watchlist: PublicWatchlistItem[];
}

// Response types
export interface ProfileResponse {
  user: ProfileUser;
  pagination: Partial<Record<ProfileTab, PaginationInfo>>;
}

export interface PublicProfileResponse {
  user: PublicProfileUser;
  pagination: Partial<Record<ProfileTab, PaginationInfo>>;
}

// Helper to create pagination info
export function createPaginationInfo(
  page: number,
  limit: number,
  totalCount: number
): PaginationInfo {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasMore: page < totalPages,
  };
}

// Helper to strip private notes from watchlist items
export function toPublicWatchlist(
  watchlist: WatchlistWithShow[] | undefined
): PublicWatchlistItem[] {
  if (!watchlist) return [];
  return watchlist.map(({ id, addedAt, show }) => ({ id, addedAt, show }));
}
