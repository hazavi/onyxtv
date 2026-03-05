"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Lightbulb02,
  EyeOff,
  Eye,
  ChromeCast,
} from "@untitledui/icons";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cn } from "@/helpers/utils";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import { type MovieDetail, backdrop } from "@/helpers/tmdb";

export default function MovieWatchClient({
  movie,
  streamToken,
}: {
  movie: MovieDetail;
  streamToken: string;
}) {
  const [lightsOff, setLightsOff] = useState(false);
  const [hideServer, setHideServer] = useState(false);
  const [chromecast, setChromecast] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHideServer(localStorage.getItem("onyxtv_hideServer") === "true");
    setChromecast(localStorage.getItem("onyxtv_chromecast") === "true");
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem("onyxtv_hideServer", String(hideServer)); }, [hideServer, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("onyxtv_chromecast", String(chromecast)); }, [chromecast, hydrated]);

  const streamUrl = `/api/stream?type=movie&id=${movie.id}&token=${streamToken}&hideServer=${hideServer}&chromecast=${chromecast}`;

  usePlayerProgress({
    tmdbId: movie.id,
    type: "movie",
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
  });

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
          src={backdrop(movie.backdrop_path)}
          alt={movie.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 gradient-overlay" />
      </div>

      {/* Breadcrumbs */}
      <div className="relative -mt-32 z-10 max-w-[1080px] mx-auto px-4 sm:px-8 pt-4">
        <Breadcrumbs
          items={[
            { label: "Movies", href: "/search?type=movie" },
            { label: movie.title, href: `/movie/${movie.id}` },
            { label: "Watch" },
          ]}
        />
      </div>

      {/* Player + Controls */}
      <div
        className={cn(
          "relative w-full",
          lightsOff ? "z-[50]" : "z-10"
        )}
      >
        <div className="max-w-[1080px] mx-auto px-4 sm:px-8">
          <div
            className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/50"
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

          {/* Controls bar */}
          <div className="flex items-center justify-between mt-2 glass rounded-xl px-3 py-2 gap-2">
            <span className="text-xs font-bold text-white/50 truncate min-w-0">{movie.title}</span>
            <div className="flex items-center gap-1.5 shrink-0">
            <CtrlBtn active={lightsOff} onClick={() => setLightsOff((v) => !v)} icon={Lightbulb02} label="Lights" />
            <CtrlBtn active={hideServer} onClick={() => setHideServer((v) => !v)} icon={hideServer ? EyeOff : Eye} label={hideServer ? "Show server" : "Hide server"} />
              <CtrlBtn active={chromecast} onClick={() => setChromecast((v) => !v)} icon={ChromeCast} label="Chromecast" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
