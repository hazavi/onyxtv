/* ─────────── Watch History Types ─────────── */

export interface WatchProgress {
  watched: number;
  duration: number;
}

export interface EpisodeProgress {
  season: number;
  episode: number;
  progress: WatchProgress;
  last_updated: number;
}

export interface WatchHistoryEntry {
  id: number;
  type: "movie" | "tv";
  title: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  progress: WatchProgress;
  last_season_watched?: number;
  last_episode_watched?: number;
  show_progress?: Record<string, EpisodeProgress>;
  last_updated: number;
}

export type WatchHistoryMap = Record<string, WatchHistoryEntry>;
