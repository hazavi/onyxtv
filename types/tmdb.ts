/* ─────────── TMDB Types ─────────── */

export interface TMDBMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type?: string;
  popularity: number;
}

export interface TMDBListResult {
  page: number;
  total_pages: number;
  total_results: number;
  results: TMDBMedia[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
  overview: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}

export interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  status: string;
  tagline: string;
  production_companies: ProductionCompany[];
  credits: { cast: CastMember[]; crew: CrewMember[] };
  videos: { results: Video[] };
  recommendations: TMDBListResult;
}

export interface TVDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  status: string;
  tagline: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: Season[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  production_companies: ProductionCompany[];
  credits: { cast: CastMember[]; crew: CrewMember[] };
  videos: { results: Video[] };
  recommendations: TMDBListResult;
}

export interface SeasonDetail {
  id: number;
  name: string;
  season_number: number;
  episodes: Episode[];
}

export interface PersonCredit {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  character?: string;
  job?: string;
  media_type: "movie" | "tv";
  popularity: number;
}

export interface PersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  also_known_as: string[];
  combined_credits: {
    cast: PersonCredit[];
    crew: PersonCredit[];
  };
}
