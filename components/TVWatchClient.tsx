"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SearchLg,
  SwitchVertical01,
  Loading02,
  Lightbulb02,
  Expand06,
  Minimize01,
  FastForward,
  EyeOff,
  Eye,
  ChromeCast,
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

  const videoRef = useRef<HTMLDivElement>(null);
  const [videoHeight, setVideoHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVideoHeight(el.offsetHeight));
    ro.observe(el);
    setVideoHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const initialSeason = Number(searchParams.get("s")) || 1;
  const initialEpisode = Number(searchParams.get("e")) || 1;

  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [episodes, setEpisodes] = useState<SeasonDetail["episodes"]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  /* ── Control states (some persisted to localStorage) ── */
  const [lightsOff, setLightsOff] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [autoNext, setAutoNext] = useState(false);
  const [hideServer, setHideServer] = useState(false);
  const [chromecast, setChromecast] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAutoNext(localStorage.getItem("onyxtv_autoNext") === "true");
    setHideServer(localStorage.getItem("onyxtv_hideServer") === "true");
    setChromecast(localStorage.getItem("onyxtv_chromecast") === "true");
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem("onyxtv_autoNext", String(autoNext)); }, [autoNext, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("onyxtv_hideServer", String(hideServer)); }, [hideServer, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("onyxtv_chromecast", String(chromecast)); }, [chromecast, hydrated]);

  const streamUrl = `/api/stream?type=tv&id=${tv.id}&s=${season}&e=${episode}&token=${streamToken}&hideServer=${hideServer}&chromecast=${chromecast}`;

  const currentEpRuntime = useMemo(() => {
    const ep = episodes.find((e) => e.episode_number === episode);
    return ep?.runtime || 30;
  }, [episodes, episode]);

  usePlayerProgress({
    tmdbId: tv.id,
    type: "tv",
    title: tv.name,
    overview: tv.overview,
    poster_path: tv.poster_path,
    backdrop_path: tv.backdrop_path,
    season,
    episode,
    runtimeMinutes: currentEpRuntime,
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

  /* ── Episode navigation ── */
  const sortedEpisodes = useMemo(
    () => [...episodes].sort((a, b) => a.episode_number - b.episode_number),
    [episodes]
  );

  const currentIndex = sortedEpisodes.findIndex(
    (ep) => ep.episode_number === episode
  );

  /* ── Auto-next: listen for ended events from embedded player ── */
  useEffect(() => {
    if (!autoNext) return;
    function handleMessage(e: MessageEvent) {
      const d = e.data;
      if (
        d === "ended" ||
        d?.event === "ended" ||
        d?.type === "ended" ||
        d?.name === "ended"
      ) {
        const sorted = [...episodes].sort(
          (a, b) => a.episode_number - b.episode_number
        );
        const idx = sorted.findIndex((ep) => ep.episode_number === episode);
        if (idx >= 0 && idx < sorted.length - 1) {
          const next = sorted[idx + 1].episode_number;
          setEpisode(next);
          router.replace(`/watch/tv/${tv.id}?s=${season}&e=${next}`, {
            scroll: false,
          });
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [autoNext, episodes, episode, season, tv.id, router]);

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

  /* ── Reusable toggle button (icon-only) ── */
  const CtrlBtn = ({
    active,
    onClick,
    icon: Icon,
    label,
  }: {
    active: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "p-2 rounded-lg transition hover:cursor-pointer",
        active
          ? "bg-accent/20 text-accent border border-accent/30"
          : "bg-white/[0.06] text-white/40 border border-white/[0.08] hover:text-white/70 hover:bg-white/[0.1]"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );

  return (
    <div className="min-h-screen mb-20">
      {/* Lights-off overlay */}
      {lightsOff && (
        <div
          className="fixed inset-0 bg-black/95 z-[45]"
          onClick={() => setLightsOff(false)}
        />
      )}

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

      {/* Main layout */}
      <div
        className={cn(
          "relative max-w-[1400px] mx-auto px-4 sm:px-8",
          lightsOff ? "z-[50]" : "z-10"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-0",
            !expanded && "lg:flex-row lg:gap-0"
          )}
        >
          {/* Left: Video player + controls */}
          <div className="flex-1 min-w-0">
            <div
              ref={videoRef}
              className={cn(
                "w-full bg-black overflow-hidden",
                expanded
                  ? "rounded-t-xl"
                  : "rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none"
              )}
            >
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

            {/* Controls bar — same width as video */}
            <div className="flex items-center justify-between mt-2 glass rounded-xl px-3 py-2 gap-2">
              {/* Left: Title */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-xs font-bold text-white/50 shrink-0 hidden sm:block">
                  {tv.name} S{season} E{episode}:
                </span>
                <span className="text-xs text-white/50 truncate">
                  {sortedEpisodes[currentIndex]?.name || tv.name}
                </span>
              </div>

              {/* Right: Toggle controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <CtrlBtn active={autoNext} onClick={() => setAutoNext((v) => !v)} icon={FastForward} label="Auto-next" />
                <CtrlBtn active={lightsOff} onClick={() => setLightsOff((v) => !v)} icon={Lightbulb02} label="Lights" />
                <CtrlBtn active={expanded} onClick={() => setExpanded((v) => !v)} icon={expanded ? Minimize01 : Expand06} label={expanded ? "Collapse" : "Expand"} />
                <CtrlBtn active={hideServer} onClick={() => setHideServer((v) => !v)} icon={hideServer ? EyeOff : Eye} label={hideServer ? "Show server" : "Hide server"} />
                <CtrlBtn active={chromecast} onClick={() => setChromecast((v) => !v)} icon={ChromeCast} label="Chromecast" />
              </div>
            </div>
          </div>

          {/* Right / Below: Episodes panel */}
          <div
            className={cn(
              "w-full shrink-0 glass flex flex-col",
              expanded
                ? "rounded-b-xl max-h-[400px]"
                : "lg:w-[340px] rounded-b-xl lg:rounded-r-xl lg:rounded-bl-none max-h-[400px]"
            )}
            style={
              !expanded && videoHeight != null
                ? { maxHeight: `${videoHeight}px`, overflow: "hidden" }
                : undefined
            }
          >
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
                      "bg-white/[0.06] border border-white/[0.1] text-white/50 hover:cursor-pointer hover:text-white/80"
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
                      "px-2.5 py-1 rounded-md text-xs font-medium transition hover:cursor-pointer",
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
                          "flex items-center gap-3 w-full px-4 py-2.5 text-left transition hover:cursor-pointer hover:bg-white/[0.04]",
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
