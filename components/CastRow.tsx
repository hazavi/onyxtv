"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { img } from "@/helpers/tmdb";
import type { CastMember } from "@/types/tmdb";

interface Props {
  cast: CastMember[];
}

export default function CastRow({ cast }: Props) {
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
    <section className="mt-14 group/row relative">
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <h2 className="text-base sm:text-lg md:text-2xl font-bold text-white tracking-tight">
          Cast
        </h2>
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
          {cast.map((c) => (
            <Link
              href={`/person/${c.id}`}
              key={c.id}
              className="shrink-0 w-[130px] sm:w-[150px] rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.06] transition-all duration-200"
            >
              <div className="relative aspect-[3/4] bg-white/[0.03]">
                <Image
                  src={img(c.profile_path, "w342")}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 130px, 150px"
                  className="object-cover"
                />
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-white/90 truncate">{c.name}</p>
                <p className="text-[10px] text-white/35 truncate mt-0.5">{c.character}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
