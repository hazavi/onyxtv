import type {
  TMDBMedia,
  TMDBListResult,
  MovieDetail,
  TVDetail,
  SeasonDetail,
} from "@/types/tmdb";

export type { TMDBMedia, TMDBListResult, MovieDetail, TVDetail, SeasonDetail };
export type {
  Genre,
  CastMember,
  CrewMember,
  Season,
  Episode,
} from "@/types/tmdb";

/* ─────────── Config ─────────── */

const TMDB_TOKEN = process.env.TMDB_TOKEN!;
const STREAM_BASE = process.env.NEXT_PUBLIC_STREAM_BASE_URL;

const BASE = "https://api.themoviedb.org/3";

const headers: HeadersInit = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  accept: "application/json",
};

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
  revalidate = 3600
): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate, tags: [`tmdb-${path}`] },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${res.statusText}`);
  return res.json();
}

/* ─────────── List endpoints ─────────── */

export function getTrending(
  type: "movie" | "tv" | "all" = "all",
  window: "day" | "week" = "week"
) {
  return tmdbFetch<TMDBListResult>(`/trending/${type}/${window}`);
}

export function getPopular(type: "movie" | "tv", page = 1) {
  return tmdbFetch<TMDBListResult>(`/${type}/popular`, { page: String(page) });
}

export function getTopRated(type: "movie" | "tv", page = 1) {
  return tmdbFetch<TMDBListResult>(`/${type}/top_rated`, { page: String(page) });
}

export function getOnTheAir(page = 1) {
  return tmdbFetch<TMDBListResult>("/tv/on_the_air", { page: String(page) });
}

export function getNowPlaying() {
  return tmdbFetch<TMDBListResult>("/movie/now_playing");
}

export function getAiringToday() {
  return tmdbFetch<TMDBListResult>("/tv/airing_today");
}

export function searchMulti(query: string, page = 1) {
  return tmdbFetch<TMDBListResult>("/search/multi", {
    query,
    page: String(page),
  });
}

/* ─────────── Detail endpoints ─────────── */

export function getMovieDetail(id: number) {
  return tmdbFetch<MovieDetail>(`/movie/${id}`, {
    append_to_response: "credits,recommendations",
  });
}

export function getTVDetail(id: number) {
  return tmdbFetch<TVDetail>(`/tv/${id}`, {
    append_to_response: "credits,recommendations",
  });
}

export function getSeasonDetail(tvId: number, seasonNumber: number) {
  return tmdbFetch<SeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`);
}

/* ─────────── Image helpers ─────────── */

export const img = (path: string | null, size = "w500") =>
  path
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" fill="%23181820"><rect width="500" height="750"/><text x="250" y="375" text-anchor="middle" fill="%23555" font-size="20">No Image</text></svg>')}`;

export const backdrop = (path: string | null) => img(path, "original");

/* ─────────── Stream URL helpers ─────────── */

export function getMovieStreamUrl(tmdbId: number) {
  return `${STREAM_BASE}/movie/${tmdbId}?autoPlay=true&title=false&hideServer=true&chromecast=false&theme=FF0000`;
}

export function getTVStreamUrl(
  tmdbId: number,
  season: number,
  episode: number
) {
  return `${STREAM_BASE}/tv/${tmdbId}/${season}/${episode}?autoPlay=true&nextButton=false&autoNext=false&title=false&hideServer=true&chromecast=false&theme=FF0000`;
}

/* ─────────── Utility ─────────── */

export function mediaTitle(m: TMDBMedia) {
  return m.title || m.name || "Untitled";
}

export function mediaType(m: TMDBMedia): "movie" | "tv" {
  if (m.media_type === "movie" || m.media_type === "tv") return m.media_type;
  return m.title ? "movie" : "tv";
}

export function mediaYear(m: TMDBMedia) {
  const d = m.release_date || m.first_air_date;
  return d ? d.slice(0, 4) : "";
}
