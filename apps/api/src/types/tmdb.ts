/**
 * TMDB (The Movie Database) API Response Types
 */

/**
 * Show object in the popular/search results list
 */
export interface TmdbShowListItem {
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[];
  id: number;
  name: string;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  vote_average: number;
  vote_count: number;
}

/**
 * Response from the popular TV shows endpoint
 */
export interface TmdbPopularShowsResponse {
  page: number;
  results: TmdbShowListItem[];
  total_pages: number;
  total_results: number;
}

/**
 * Creator information
 */
export interface TmdbCreator {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string;
}

/**
 * Genre information
 */
export interface TmdbGenre {
  id: number;
  name: string;
}

/**
 * Episode information
 */
export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
}

/**
 * Network information
 */
export interface TmdbNetwork {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

/**
 * Production company information
 */
export interface TmdbProductionCompany {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

/**
 * Production country information
 */
export interface TmdbProductionCountry {
  iso_3166_1: string;
  name: string;
}

/**
 * Season information
 */
export interface TmdbSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

/**
 * Spoken language information
 */
export interface TmdbSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

/**
 * Detailed TV show information from the show details endpoint
 */
export interface TmdbShowDetails {
  adult: boolean;
  backdrop_path: string;
  created_by: TmdbCreator[];
  episode_run_time: number[];
  first_air_date: string;
  genres: TmdbGenre[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: TmdbEpisode;
  name: string;
  next_episode_to_air: string;
  networks: TmdbNetwork[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: TmdbProductionCompany[];
  production_countries: TmdbProductionCountry[];
  seasons: TmdbSeason[];
  spoken_languages: TmdbSpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
}

/**
 * Cast member role information
 */
export interface TmdbRole {
  credit_id: string;
  character: string;
  episode_count: number;
}

/**
 * Aggregate cast member information
 */
export interface TmdbAggregateCastMember {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  roles: TmdbRole[];
  total_episode_count: number;
  order: number;
}

/**
 * Crew member job information
 */
export interface TmdbJob {
  credit_id: string;
  job: string;
  episode_count: number;
}

/**
 * Aggregate crew member information
 */
export interface TmdbAggregateCrewMember {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  jobs: TmdbJob[];
  department: string;
  total_episode_count: number;
}

/**
 * Response from the aggregate credits endpoint
 */
export interface TmdbAggregateCreditsResponse {
  id: number;
  cast: TmdbAggregateCastMember[];
  crew: TmdbAggregateCrewMember[];
}
