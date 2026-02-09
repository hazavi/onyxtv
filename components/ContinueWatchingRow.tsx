"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronLeft, ChevronRight, Clock, X, Star } from "lucide-react";
import { getContinueWatching, removeFromHistory, type WatchHistoryEntry } from "@/lib/watchHistory";
import { img } from "@/lib/tmdb";

function formatTimestamp(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ProgressBar({ watched, duration }: { watched: number; duration: number }) {
  const pct = duration > 0 ? Math.min((watched / duration) * 100, 100) : 0;
  return (
    <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
      <div
        className="h-full bg-accent rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ContinueCard({
  entry,
  onRemove,
}: {
  entry: WatchHistoryEntry;
  onRemove: (type: "movie" | "tv", id: number) => void;
}) {
  const href =
    entry.type === "movie"
      ? `/watch/movie/${entry.id}`
      : `/watch/tv/${entry.id}?s=${entry.last_season_watched || 1}&e=${entry.last_episode_watched || 1}`;

  const { watched, duration } = entry.progress;

  return (
    <div className="group relative shrink-0 pt-3 pr-1 w-[140px] sm:w-[165px] md:w-[178px]">
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(entry.type, entry.id);
        }}
        className="absolute top-1 right-0 z-20 w-6 h-6 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-accent/80 hover:border-accent opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg"
        aria-label="Remove from continue watching"
      >
        <X className="w-3 h-3" />
      </button>

      <Link
        href={href}
        className="relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30 block"
      >
        <div className="relative aspect-[2/3] bg-white/[0.02] rounded-xl overflow-hidden border border-white/[0.04] group-hover:border-white/[0.1] transition-colors">
          <Image
            src={img(entry.poster_path, "w342")}
            alt={entry.title}
            fill
            sizes="(max-width: 640px) 140px, (max-width: 768px) 165px, 178px"
            className="object-cover"
          />

          {/* Progress bar (always visible) */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-3 pb-1.5">
            <ProgressBar watched={watched} duration={duration} />
          </div>

          {/* Hover overlay - full card */}
          <div className="absolute inset-0 bg-gradient-to-t from-black from-25% via-black/80 via-55% to-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col">
            {/* Play button - centered in card */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-accent/90 flex items-center justify-center shadow-lg shadow-accent/30">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
            </div>

            {/* Info at bottom */}
            <div className="p-3 pt-0">
              <p className="text-[13px] font-semibold text-white line-clamp-2 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                {entry.title}
              </p>
              {entry.overview && (
                <p className="text-[10px] text-white/30 line-clamp-2 mt-1 leading-relaxed">
                  {entry.overview}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="badge badge-gray text-[10px] py-0 px-1.5">
                  {entry.type.toUpperCase()}
                </span>
                {entry.type === "tv" && entry.last_season_watched && entry.last_episode_watched && (
                  <span className="badge badge-gray text-[10px] py-0 px-1.5">
                    S{entry.last_season_watched} E{entry.last_episode_watched}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-0.5 text-[10px] text-white/30 mt-1.5">
                <Clock className="w-2.5 h-2.5" />
                {formatTimestamp(watched)} / {formatTimestamp(duration)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function ContinueWatchingRow() {
  const [items, setItems] = useState<WatchHistoryEntry[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    setItems(getContinueWatching(20));
  }, []);

  function handleRemove(type: "movie" | "tv", id: number) {
    removeFromHistory(type, id);
    setItems((prev) => prev.filter((item) => !(item.type === type && item.id === id)));
  }

  function checkScroll() {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  useEffect(() => {
    const el = rowRef.current;
    if (!el || items.length === 0) return;
    const t = setTimeout(checkScroll, 100);
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", checkScroll);
    };
  }, [items]);

  function scroll(direction: "left" | "right") {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-10 group/row relative">
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white tracking-tight">
          Continue Watching
        </h1>
        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 z-10 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 z-10 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none" />
        )}

        <div
          ref={rowRef}
          className="carousel-row no-scrollbar touch-pan-x"
        >
          {items.map((entry) => (
            <ContinueCard key={`${entry.type}-${entry.id}`} entry={entry} onRemove={handleRemove} />
          ))}
        </div>
      </div>
    </section>
  );
}
