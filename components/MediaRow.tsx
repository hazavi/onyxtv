"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/helpers/utils";
import { TMDBMedia } from "@/helpers/tmdb";
import MediaCard from "./MediaCard";

interface Props {
  title: string;
  items: TMDBMedia[];
  ranked?: boolean;
}

export default function MediaRow({ title, items, ranked }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function checkScroll() {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
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
    <section className="mb-8 sm:mb-10 group/row relative">
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <h1 className={cn(
          "font-semibold text-white tracking-tight",
          ranked ? "text-3xl sm:text-2xl md:text-3xl font-bold" : "text-base sm:text-lg md:text-2xl font-bold"
        )}>{title}</h1>
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
        {/* Fade edges */}
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
          {items.map((item, i) => (
            <MediaCard
              key={`${item.id}-${i}`}
              item={item}
              rank={ranked ? i + 1 : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
