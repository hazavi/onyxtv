"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSwipe } from "@/hooks/useSwipe";
import {
  TMDBMedia,
  backdrop,
  mediaTitle,
  mediaType,
  mediaYear,
} from "@/lib/tmdb";

export default function HeroBanner({ items }: { items: TMDBMedia[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const count = items.length;

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + count) % count);
  }, [count]);

  // Swipe support
  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
    threshold: 40,
  });

  // Auto-play every 6s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext, isPaused]);

  const item = items[current];
  const type = mediaType(item);

  return (
    <section
      className="relative w-full h-[56vh] sm:h-[70vh] lg:h-[85vh] min-h-[380px] sm:min-h-[520px] overflow-hidden touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background images – stack with crossfade */}
      {items.map((it, idx) => (
        <Image
          key={it.id}
          src={backdrop(it.backdrop_path)}
          alt={mediaTitle(it)}
          fill
          priority={idx === 0}
          className={cn(
            "object-cover transition-opacity duration-700 ease-in-out",
            idx === current ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      <div className="absolute inset-0 gradient-overlay" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-10 sm:pb-16 pt-20 max-w-[1400px] mx-auto">
        <div className="max-w-2xl">
          <h1
            className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-3 sm:mb-4 tracking-tight leading-[1.05]"
            key={`title-${item.id}`}
          >
            {mediaTitle(item)}
          </h1>

          <p
            className="text-white/40 text-xs sm:text-sm lg:text-base line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 max-w-xl leading-relaxed"
            key={`overview-${item.id}`}
          >
            {item.overview}
          </p>

          {/* Badges – below overview */}
          <div className="flex items-center gap-2 mb-5 sm:mb-6 animate-fade-in-up" key={`badges-${item.id}`}>
            <span className="badge badge-gray">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {item.vote_average?.toFixed(1)}
            </span>
            <span className="badge badge-gray uppercase text-[10px] tracking-wider">{type}</span>

          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={type === "movie" ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}?s=1&e=1`}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition shadow-lg shadow-accent/20 text-sm sm:text-base"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              Watch Now
            </Link>
            <Link
              href={`/${type}/${item.id}`}
              className="inline-flex items-center gap-1.5 sm:gap-2 glass glass-hover font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition text-white/70 hover:text-white text-sm sm:text-base"
            >
              <Info className="w-4 h-4" />
              Details
            </Link>
          </div>
        </div>

        {/* Centered dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-6 sm:mt-8">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={cn(
                "rounded-full transition-all duration-300 cursor-pointer",
                idx === current
                  ? "w-6 h-1.5 bg-accent"
                  : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
