"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Star01,
  SearchLg,
  SwitchVertical01,
  ChevronLeft,
  ChevronRight,
  Loading02,
} from "@untitledui/icons";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cn } from "@/helpers/utils";
import {
  backdrop,
  type TVDetail,
  type SeasonDetail,
} from "@/helpers/tmdb";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";

const EPISODES_PER_PAGE = 50;

export default function TVWatchClient({
  tv,
  streamToken,
}: {
  tv: TVDetail;
  streamToken: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSeason = Number(searchParams.get("s")) || 1;
  const initialEpisode = Number(searchParams.get("e")) || 1;

  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [episodes, setEpisodes] = useState<SeasonDetail["episodes"]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const streamUrl = `/api/stream?type=tv&id=${tv.id}&s=${season}&e=${episode}&token=${streamToken}`;

  usePlayerProgress({
    tmdbId: tv.id,
    type: "tv",
    title: tv.name,
    overview: tv.overview,
    poster_path: tv.poster_path,
    backdrop_path: tv.backdrop_path,
    season,
    episode,
  });

  useEffect(() => {
    setLoading(true);
    setPage(0);
    setSearchQuery("");
    fetch(`/api/season?tvId=${tv.id}&season=${season}`)
      .then((r) => r.json())
      .then((data: SeasonDetail) => {
        setEpisodes(data.episodes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tv.id, season]);

  function selectSeason(s: number) {
    setSeason(s);
    setEpisode(1);
    router.replace(`/watch/tv/${tv.id}?s=${s}&e=1`, { scroll: false });
  }

  function selectEpisode(e: number) {
    setEpisode(e);
    router.replace(`/watch/tv/${tv.id}?s=${season}&e=${e}`, { scroll: false });
  }

  const validSeasons = tv.seasons?.filter((s) => s.season_number > 0) || [];

  const filteredEpisodes = useMemo(() => {
    let list = [...episodes];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (ep) =>
          String(ep.episode_number).includes(q) ||
          ep.name.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) =>
      sortAsc
        ? a.episode_number - b.episode_number
        : b.episode_number - a.episode_number
    );

    return list;
  }, [episodes, searchQuery, sortAsc]);

  const totalPages = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);
  const paginatedEpisodes = filteredEpisodes.slice(
    page * EPISODES_PER_PAGE,
    (page + 1) * EPISODES_PER_PAGE
  );

  const pageStart = page * EPISODES_PER_PAGE + 1;
  const pageEnd = Math.min(
    (page + 1) * EPISODES_PER_PAGE,
    filteredEpisodes.length
  );
  const pageLabel =
    filteredEpisodes.length > 0
      ? `${String(pageStart).padStart(3, "0")}-${String(pageEnd).padStart(3, "0")}`
      : "---";

  return (
    <div className="min-h-screen mb-20">
      {/* Backdrop */}
      <div className="relative w-full h-[40vh] min-h-[200px]">
        <Image
          src={backdrop(tv.backdrop_path)}
          alt={tv.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 gradient-overlay" />
      </div>

      {/* Breadcrumbs */}
      <div className="relative -mt-32 z-10 max-w-[1400px] mx-auto px-4 sm:px-8 pt-4">
        <Breadcrumbs
          items={[
            { label: "TV Shows", href: "/search?type=tv" },
            { label: tv.name, href: `/tv/${tv.id}` },
            { label: `S${season} E${episode}` },
          ]}
        />
      </div>

      {/* Main layout: player + episode panel side by side */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-0">
          {/* Left: Video player */}
          <div className="flex-1 min-w-0">
            <div className="w-full bg-black rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none overflow-hidden">
              <div
                className="relative w-full"
                style={{ paddingTop: "56.25%" }}
              >
                <iframe
                  key={streamUrl}
                  src={streamUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  referrerPolicy="no-referrer"
                  style={{ border: "none" }}
                />
              </div>
            </div>
          </div>

          {/* Right: Episodes panel */}
          <div className="w-full lg:w-[340px] shrink-0 glass lg:rounded-r-xl rounded-b-xl lg:rounded-bl-none flex flex-col lg:max-h-[560px]">
            {/* Panel header */}
            <div className="p-4 border-b border-white/[0.07]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Episodes</h3>
                <div className="flex items-center gap-1.5">
                  {/* Search input */}
                  <div className="relative">
                    <SearchLg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
                    <input
                      type="text"
                      placeholder="Find"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(0);
                      }}
                      className="w-20 bg-white/[0.06] border border-white/[0.1] rounded-md pl-6 pr-2 py-1 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/20 transition"
                    />
                  </div>
                  {/* Sort toggle */}
                  <button
                    onClick={() => setSortAsc((v) => !v)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition",
                      "bg-white/[0.06] border border-white/[0.1] text-white/50 hover:text-white/80"
                    )}
                    title={sortAsc ? "Ascending" : "Descending"}
                  >
                    <SwitchVertical01 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Season selector */}
              <div className="flex flex-wrap gap-1">
                {validSeasons.map((s) => (
                  <button
                    key={s.season_number}
                    onClick={() => selectSeason(s.season_number)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition",
                      season === s.season_number
                        ? "bg-accent text-white"
                        : "bg-white/[0.06] text-white/40 hover:text-white/70"
                    )}
                  >
                    S{s.season_number}
                  </button>
                ))}
              </div>
            </div>

            {/* Episode list - scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-white/30 py-12">
                  <Loading02 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Loading...</span>
                </div>
              ) : paginatedEpisodes.length === 0 ? (
                <div className="text-center py-12 text-white/30 text-xs">
                  No episodes found
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {paginatedEpisodes.map((ep) => {
                    const isActive = episode === ep.episode_number;
                    return (
                      <button
                        key={ep.episode_number}
                        onClick={() => selectEpisode(ep.episode_number)}
                        className={cn(
                          "flex items-center gap-3 w-full px-4 py-2.5 text-left transition hover:bg-white/[0.04]",
                          isActive && "bg-accent/10"
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs font-bold shrink-0 w-5 text-right",
                            isActive ? "text-accent" : "text-white/30"
                          )}
                        >
                          {ep.episode_number}
                        </span>
                        <span
                          className={cn(
                            "text-sm truncate flex-1",
                            isActive
                              ? "text-white font-medium"
                              : "text-white/60"
                          )}
                        >
                          {ep.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
