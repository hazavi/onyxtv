"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Home03,
  Film02,
  Tv03,
  SearchLg,
  XClose,
  Star01,
  Loading02,
  ChevronUp,
} from "@untitledui/icons";
import { img, mediaTitle, mediaType, mediaYear, type TMDBMedia } from "@/lib/tmdb";
import { ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: Home03, label: "Home" },
  { href: "/movies", icon: Film02, label: "Movies" },
  { href: "/tvshows", icon: Tv03, label: "TV Shows" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dockHidden, setDockHidden] = useState(false);
  const [suggestions, setSuggestions] = useState<TMDBMedia[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Debounced live search suggestions ── */
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q.trim())}`
        );
        const data = await res.json();
        setSuggestions(
          (data.results || [])
            .filter(
              (m: TMDBMedia) =>
                (m.media_type === "movie" || m.media_type === "tv") &&
                m.poster_path
            )
            .slice(0, 6)
        );
      } catch {
        setSuggestions([]);
      }
      setLoadingSuggestions(false);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleQueryChange(val: string) {
    setQuery(val);
    fetchSuggestions(val);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      closeSearch();
    }
  }

  function goToItem(item: TMDBMedia) {
    const type = mediaType(item);
    router.push(`/${type}/${item.id}`);
    closeSearch();
  }

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
    setSuggestions([]);
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    const [hrefPath, hrefQuery] = href.split("?");
    if (!pathname.startsWith(hrefPath)) return false;
    if (hrefQuery) {
      const params = new URLSearchParams(hrefQuery);
      for (const [key, value] of params) {
        if (currentSearchParams.get(key) !== value) return false;
      }
    }
    return true;
  }

  const allItems = [
    ...NAV_ITEMS,
    { href: "#search", icon: SearchLg, label: "Search" },
  ];

  return (
    <>
      {/* ─── Floating dock ─── */}
      <div className="fixed bottom-1 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5">
        {/* Toggle pill */}
        <button
          onClick={() => setDockHidden((h) => !h)}
          className={cn(
            "w-6 h-4 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/[0.08] text-white/25 hover:text-white/60 hover:bg-white/[0.1] transition-all duration-200 cursor-pointer",
            dockHidden && "mb-0"
          )}
          aria-label={dockHidden ? "Show dock" : "Hide dock"}
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              dockHidden && "rotate-180"
            )}
          />
        </button>

        {/* Dock */}
        <nav
          className={cn(
            "transition-all duration-300 ease-in-out origin-bottom",
            dockHidden
              ? "opacity-0 scale-95 translate-y-2 pointer-events-none h-0"
              : "opacity-100 scale-100 translate-y-0"
          )}
        >
        <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-2xl md:rounded-3xl bg-black/40 backdrop-blur-md border border-black/10 shadow-2xl shadow-black/40">
          {allItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "#search" ? searchOpen : isActive(item.href);

            const inner = (
              <div className="relative flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl transition-all duration-200",
                    active
                      ? "text-white bg-white/[0.12]"
                      : "text-white/40 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  <Icon className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" strokeWidth={1.8} />
                </div>
                {active && (
                  <div className="w-1 h-1 rounded-full bg-white/60" />
                )}
              </div>
            );

            if (item.href === "#search") {
              return (
                <button
                  key={item.label}
                  onClick={openSearch}
                  className="outline-none hover:cursor-pointer"
                >
                  {inner}
                </button>
              );
            }

            return (
              <Link key={item.label} href={item.href}>
                {inner}
              </Link>
            );
          })}
        </div>
        </nav>
      </div>

      {/* ─── Search overlay with live suggestions ─── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeSearch}
          />
          <div className="relative w-full max-w-xl mx-4">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3 bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] rounded-2xl px-5 py-4 shadow-2xl">
                <SearchLg
                  className="w-5 h-5 text-white/40 shrink-0"
                  strokeWidth={1.8}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search movies and TV shows..."
                  className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-white/30"
                />
                {loadingSuggestions && (
                  <Loading02 className="w-4 h-4 text-white/30 animate-spin shrink-0" />
                )}
                <button
                  type="button"
                  onClick={closeSearch}
                  className="text-white/40 hover:text-white/80 transition hover:cursor-pointer"
                >
                  <XClose className="w-5 h-5" strokeWidth={1.8} />
                </button>
              </div>
            </form>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="mt-2 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] shadow-2xl overflow-hidden">
                {suggestions.map((item) => {
                  const type = mediaType(item);
                  return (
                    <button
                      key={`${type}-${item.id}`}
                      onClick={() => goToItem(item)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/[0.06] transition cursor-pointer"
                    >
                      <div className="shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-white/[0.02]">
                        <Image
                          src={img(item.poster_path, "w92")}
                          alt={mediaTitle(item)}
                          width={40}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {mediaTitle(item)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <span>{mediaYear(item)}</span>
                          <span className="flex items-center gap-0.5">
                            <Star01 className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {item.vote_average?.toFixed(1)}
                          </span>
                          <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/[0.08] text-white/50">
                            {type}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {query.trim() && (
                  <button
                    onClick={handleSearch as unknown as () => void}
                    className="w-full px-4 py-3 text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition text-center border-t border-white/[0.06] cursor-pointer"
                  >
                    View all results for &quot;{query.trim()}&quot;
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
