/* ─── Watch History (localStorage) ─── */

import type {
  WatchProgress,
  EpisodeProgress,
  WatchHistoryEntry,
  WatchHistoryMap,
} from "@/types/watchHistory";

/* Re-export types for convenience */
export type {
  WatchProgress,
  EpisodeProgress,
  WatchHistoryEntry,
  WatchHistoryMap,
} from "@/types/watchHistory";

const STORAGE_KEY = "onyxtv_watch_history";

function getAll(): WatchHistoryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(map: WatchHistoryMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Key format: "m{id}" for movies, "t{id}" for TV */
function makeKey(type: "movie" | "tv", id: number) {
  return `${type === "movie" ? "m" : "t"}${id}`;
}

export function updateMovieProgress(
  id: number,
  title: string,
  poster_path: string | null,
  backdrop_path: string | null,
  currentTime: number,
  duration: number,
  overview?: string
) {
  const map = getAll();
  const key = makeKey("movie", id);
  const now = Date.now();

  map[key] = {
    id,
    type: "movie",
    title,
    overview,
    poster_path,
    backdrop_path,
    progress: { watched: currentTime, duration },
    last_updated: now,
  };

  saveAll(map);
}

export function updateTVProgress(
  id: number,
  title: string,
  poster_path: string | null,
  backdrop_path: string | null,
  season: number,
  episode: number,
  currentTime: number,
  duration: number,
  overview?: string
) {
  const map = getAll();
  const key = makeKey("tv", id);
  const now = Date.now();
  const epKey = `s${season}e${episode}`;

  const existing = map[key];
  const showProgress = existing?.show_progress || {};

  showProgress[epKey] = {
    season,
    episode,
    progress: { watched: currentTime, duration },
    last_updated: now,
  };

  map[key] = {
    id,
    type: "tv",
    title,
    overview,
    poster_path,
    backdrop_path,
    progress: { watched: currentTime, duration },
    last_season_watched: season,
    last_episode_watched: episode,
    show_progress: showProgress,
    last_updated: now,
  };

  saveAll(map);
}

/** Get sorted entries (most recently watched first), optionally limited */
export function getWatchHistory(limit?: number): WatchHistoryEntry[] {
  const map = getAll();
  const entries = Object.values(map).sort(
    (a, b) => b.last_updated - a.last_updated
  );
  return limit ? entries.slice(0, limit) : entries;
}

/** Get only items that are in progress (watched > 30s and < 90% done) */
export function getContinueWatching(limit = 20): WatchHistoryEntry[] {
  return getWatchHistory()
    .filter((entry) => {
      const { watched, duration } = entry.progress;
      if (!duration || duration === 0) return false;
      const pct = watched / duration;
      return watched > 30 && pct < 0.9;
    })
    .slice(0, limit);
}

export function removeFromHistory(type: "movie" | "tv", id: number) {
  const map = getAll();
  delete map[makeKey(type, id)];
  saveAll(map);
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
