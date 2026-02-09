"use client";

import { useEffect, useCallback } from "react";
import { updateMovieProgress, updateTVProgress } from "@/lib/watchHistory";

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
 * Hook to listen to vidup.to player postMessage events and persist progress.
 * Throttles timeupdate to once every 5 seconds to avoid excessive writes.
 */
export function usePlayerProgress(media: PlayerMediaInfo) {
  const handler = useCallback(
    (() => {
      let lastSave = 0;
      const streamOrigin = process.env.NEXT_PUBLIC_STREAM_BASE_URL ?? "";
      return ({ origin, data }: MessageEvent) => {
        if (origin !== streamOrigin || !data) return;
        if (data.type !== "PLAYER_EVENT") return;

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
