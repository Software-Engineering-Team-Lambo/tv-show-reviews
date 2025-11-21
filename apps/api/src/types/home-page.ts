export interface HomePageShow {
  id: number;
  title: string;
  description: string | null;
  releaseDate: Date | null;
  popularity: number | null;
  genres: string[];
  rating: number;
  reviewCount: number;
}

export interface HomePageResponse {
  popularShows: HomePageShow[];
  newReleases: HomePageShow[];
  genres: { id: number; name: string }[];
}
