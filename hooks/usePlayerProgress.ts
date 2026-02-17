"use client";

import { useEffect, useCallback } from "react";
import { updateMovieProgress, updateTVProgress } from "@/helpers/watchHistory";

interface PlayerMediaInfo {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  season?: number;
  episode?: number;
}

/**
 * Hook to listen to the embedded player's postMessage events and persist
 * progress.  Throttles timeupdate to once every 5 seconds.
 *
 * Origin check validates message shape rather than a hard-coded domain
 * so the streaming base URL never needs to be on the client.
 */
export function usePlayerProgress(media: PlayerMediaInfo) {
  const handler = useCallback(
    (() => {
      let lastSave = 0;
      return ({ data }: MessageEvent) => {
        // Validate message shape instead of origin (URL is server-only)
        if (!data || typeof data !== "object") return;
        if (data.type !== "PLAYER_EVENT" || !data.data) return;

        const { event, currentTime, duration } = data.data;

        // Only save on meaningful events
        const shouldSave =
          event === "pause" ||
          event === "seeked" ||
          event === "ended" ||
          (event === "timeupdate" && Date.now() - lastSave > 5000);

        if (!shouldSave || !currentTime || !duration) return;
        lastSave = Date.now();

        if (media.type === "movie") {
          updateMovieProgress(
            media.tmdbId,
            media.title,
            media.poster_path,
            media.backdrop_path,
            currentTime,
            duration,
            media.overview
          );
        } else {
          updateTVProgress(
            media.tmdbId,
            media.title,
            media.poster_path,
            media.backdrop_path,
            media.season || 1,
            media.episode || 1,
            currentTime,
            duration,
            media.overview
          );
        }
      };
    })(),
    [media.tmdbId, media.type, media.title, media.overview, media.poster_path, media.backdrop_path, media.season, media.episode]
  );

  useEffect(() => {
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [handler]);
}
