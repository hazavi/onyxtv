"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/helpers/utils";
import { img, type TMDBMedia } from "@/helpers/tmdb";
import MediaCard from "./MediaCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Provider {
  id: number;
  name: string;
  logo: string;
}

interface Props {
  initialItems: TMDBMedia[];
  initialProviderId: number;
  providers: Provider[];
}

export default function StreamingProviders({ initialItems, initialProviderId, providers }: Props) {
  const [activeProvider, setActiveProvider] = useState(initialProviderId);
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [items, setItems] = useState<TMDBMedia[]>(initialItems);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (activeProvider === initialProviderId && mediaType === "movie") {
      setItems(initialItems);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/discover?type=${mediaType}&provider=${activeProvider}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setItems(data.results?.slice(0, 20) ?? []);
          rowRef.current?.scrollTo({ left: 0 });
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeProvider, mediaType, initialProviderId, initialItems]);

  const providerName = providers.find((p) => p.id === activeProvider)?.name ?? "";

  if (providers.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-10 group/row relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div>
          <h2 className="text-base sm:text-lg md:text-2xl font-bold text-white tracking-tight">
            Streaming Providers
          </h2>
          <p className="text-xs sm:text-sm text-white/30 mt-0.5">
            Browse content from your favorite streaming services
          </p>
        </div>
        {/* Movies / TV toggle */}
        <div className="flex items-center gap-1 bg-white/[0.06] rounded-lg p-0.5 border border-white/[0.06]">
          <button
            onClick={() => setMediaType("movie")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
              mediaType === "movie"
                ? "bg-white/[0.12] text-white"
                : "text-white/40 hover:text-white/60"
            )}
          >
            Movies
          </button>
          <button
            onClick={() => setMediaType("tv")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
              mediaType === "tv"
                ? "bg-white/[0.12] text-white"
                : "text-white/40 hover:text-white/60"
            )}
          >
            TV Shows
          </button>
        </div>
      </div>

      {/* Provider logos */}
      <div className="flex items-center gap-2 sm:gap-3 mt-4 mb-5 px-1 overflow-x-auto no-scrollbar">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => setActiveProvider(provider.id)}
            className={cn(
              "shrink-0 flex items-center gap-2 px-2 py-2 rounded-xl border transition cursor-pointer",
              activeProvider === provider.id
                ? "bg-white/[0.08] border-accent/50"
                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]"
            )}
          >
            <Image
              src={img(provider.logo, "w92")}
              alt={provider.name}
              width={32}
              height={32}
              className="rounded-md w-10 h-10 object-cover"
              unoptimized
            />
            <span className="text-sm font-medium text-white/70 hidden sm:inline whitespace-nowrap">
              {provider.name}
            </span>
          </button>
        ))}
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <h3 className="text-sm sm:text-base font-semibold text-white/80">
          {providerName} {mediaType === "movie" ? "Movies" : "TV Shows"}
        </h3>
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

      {/* Media row */}
      <div className="relative">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 z-10 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 z-10 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none" />
        )}

        <div
          ref={rowRef}
          className={cn(
            "carousel-row no-scrollbar touch-pan-x",
            loading && "opacity-50 pointer-events-none"
          )}
        >
          {items.map((item, i) => (
            <MediaCard key={`${item.id}-${i}`} item={item} />
          ))}
          {!loading && items.length === 0 && (
            <p className="text-white/30 text-sm py-8">No results found.</p>
          )}
        </div>
      </div>
    </section>
  );
}
