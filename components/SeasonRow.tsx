"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { img } from "@/helpers/tmdb";

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
}

interface Props {
  tvId: number;
  seasons: Season[];
}

export default function SeasonRow({ tvId, seasons }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function checkScroll() {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const t = setTimeout(checkScroll, 100);
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", checkScroll);
    };
  }, []);

  function scroll(direction: "left" | "right") {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="mt-14 group/row relative">
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight">
          Seasons
        </h1>
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
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
          {seasons.map((s) => (
            <Link
              key={s.id}
              href={`/watch/tv/${tvId}?s=${s.season_number}&e=1`}
              className="group shrink-0 w-[110px] sm:w-[125px] md:w-[140px]"
            >
              <div className="relative aspect-[2/3] bg-white/[0.02] rounded-xl overflow-hidden border border-white/[0.04] group-hover:border-white/[0.1] transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-xl group-hover:shadow-black/30">
                <Image
                  src={img(s.poster_path, "w342")}
                  alt={s.name}
                  fill
                  sizes="(max-width: 640px) 110px, (max-width: 768px) 125px, 140px"
                  className="object-cover"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black from-15% via-black/70 via-50% to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col">
                  {/* Centered play button */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-accent/90 flex items-center justify-center shadow-lg shadow-accent/30">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>

                  {/* Info at bottom */}
                  <div className="p-2.5 pt-0">
                    <p className="text-[12px] font-semibold text-white truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {s.name}
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      {s.episode_count} Episodes
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
