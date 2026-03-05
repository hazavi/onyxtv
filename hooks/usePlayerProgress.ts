"use client";

import { useEffect, useRef, useCallback } from "react";
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
  /** TMDB runtime in minutes (movie.runtime or episode.runtime). Defaults to 30. */
  runtimeMinutes?: number;
}

const SAVE_INTERVAL_MS = 10_000; // update every 10 seconds

/**
 * Persists watch progress using two strategies:
 *
 * 1. **Time-on-page** – saves immediately on mount and increments every 10 s
 *    so the item always appears in "Continue Watching".
 * 2. **postMessage** – if the embedded player sends progress events the real
 *    currentTime/duration overrides the timer-based values.
 */
export function usePlayerProgress(media: PlayerMediaInfo) {
  /* Keep a mutable ref so the save helper always reads the latest values
     without needing to re-register the interval/listener. */
  const mediaRef = useRef(media);
  mediaRef.current = media;

  const hasRealDataRef = useRef(false);
  const elapsedRef = useRef(0);

  const durationSec = (media.runtimeMinutes || 30) * 60;

  /* ── Save helper (stable ref, no deps) ── */
  const save = useCallback((watched: number, duration: number) => {
    const m = mediaRef.current;
    if (m.type === "movie") {
      updateMovieProgress(
        m.tmdbId,
        m.title,
        m.poster_path,
        m.backdrop_path,
        watched,
        duration,
        m.overview
      );
    } else {
      updateTVProgress(
        m.tmdbId,
        m.title,
        m.poster_path,
        m.backdrop_path,
        m.season || 1,
        m.episode || 1,
        watched,
        duration,
        m.overview
      );
    }
  }, []);

  /* ── Timer-based fallback ── */
  useEffect(() => {
    hasRealDataRef.current = false;
    elapsedRef.current = 0;

    // Immediately record the item so it shows in "Continue Watching"
    save(60, durationSec);

    const id = setInterval(() => {
      if (hasRealDataRef.current) return;
      elapsedRef.current += SAVE_INTERVAL_MS / 1000;
      // Cap at 85 % so the entry stays in "continue watching"
      const watched = Math.min(60 + elapsedRef.current, durationSec * 0.85);
      save(watched, durationSec);
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(id);
      // Final save on unmount
      if (!hasRealDataRef.current) {
        const watched = Math.min(60 + elapsedRef.current, durationSec * 0.85);
        save(watched, durationSec);
      }
    };
  }, [media.tmdbId, media.type, media.season, media.episode, durationSec, save]);

  /* ── postMessage listener (handles several common formats) ── */
  useEffect(() => {
    let lastSave = 0;

    function handler({ data }: MessageEvent) {
      if (!data || typeof data !== "object") return;

      let event: string | undefined;
      let currentTime: number | undefined;
      let duration: number | undefined;

      // Format A: { type: "PLAYER_EVENT", data: { event, currentTime, duration } }
      if (data.type === "PLAYER_EVENT" && data.data) {
        event = data.data.event;
        currentTime = data.data.currentTime;
        duration = data.data.duration;
      }
      // Format B: { event, currentTime, duration }
      else if (data.event && typeof data.currentTime === "number") {
        event = data.event;
        currentTime = data.currentTime;
        duration = data.duration;
      }

      if (!event || !currentTime || !duration) return;

      const shouldSave =
        event === "pause" ||
        event === "seeked" ||
        event === "ended" ||
        (event === "timeupdate" && Date.now() - lastSave > 5000);

      if (!shouldSave) return;

      hasRealDataRef.current = true;
      lastSave = Date.now();
      save(currentTime, duration);
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [save]);
}
