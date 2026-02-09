"use client";

import Link from "next/link";
import Image from "next/image";
import { Star01, Calendar, Clock } from "@untitledui/icons";
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import { type MovieDetail, getMovieStreamUrl, backdrop } from "@/lib/tmdb";

export default function MovieWatchClient({ movie }: { movie: MovieDetail }) {
  const streamUrl = getMovieStreamUrl(movie.id);

  usePlayerProgress({
    tmdbId: movie.id,
    type: "movie",
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
  });

  return (
    <div className="min-h-screen mb-20">
      {/* Backdrop */}
      <div className="relative w-full h-[40vh] min-h-[200px] ">
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

      {/* Player */}
      <div className="relative z-10 w-full">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-8">
          <div className="relative w-full rounded-xl overflow-hidden shadow-2xl shadow-black/50" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={streamUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
              referrerPolicy="origin"
              style={{ border: "none" }}
            />
          </div>
        </div>
      </div>
     
    </div >
  );
}
