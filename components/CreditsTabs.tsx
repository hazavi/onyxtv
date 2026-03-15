"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star01 } from "@untitledui/icons";
import { img } from "@/helpers/tmdb";

interface Credit {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  character?: string;
  job?: string;
  media_type: "movie" | "tv";
}

interface Tab {
  label: string;
  credits: Credit[];
}

interface Props {
  tabs: Tab[];
}

export default function CreditsTabs({ tabs }: Props) {
  const visibleTabs = tabs.filter((t) => t.credits.length > 0);
  const [active, setActive] = useState(0);

  if (visibleTabs.length === 0) return null;

  const current = visibleTabs[active];

  return (
    <section className="mt-14">
      <div className="flex items-center gap-1 mb-6">
        {visibleTabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
              active === i
                ? "bg-white/10 text-white border border-white/10"
                : "text-white/35 hover:text-white/60 hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-[10px] ${active === i ? "text-white/40" : "text-white/20"}`}>
              {tab.credits.length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {current.credits.slice(0, 20).map((credit) => {
          const href = credit.media_type === "movie"
            ? `/movie/${credit.id}`
            : `/tv/${credit.id}`;
          const title = credit.title || credit.name || "Untitled";
          const year = (credit.release_date || credit.first_air_date)?.slice(0, 4);
          const subtitle = credit.character || credit.job;

          return (
            <Link
              key={`${credit.media_type}-${credit.id}`}
              href={href}
              className="rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.06] hover:scale-[1.02] transition-all duration-200"
            >
              <div className="relative aspect-[2/3] bg-white/[0.03]">
                <Image
                  src={img(credit.poster_path, "w342")}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                  className="object-cover"
                />
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-white/90 truncate">{title}</p>
                {subtitle && (
                  <p className="text-[10px] text-white/35 truncate mt-0.5">{subtitle}</p>
                )}
                {year && (
                  <p className="text-[10px] text-white/25 mt-0.5">{year}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
