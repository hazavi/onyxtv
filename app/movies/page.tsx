import Link from "next/link";
import type { Metadata } from "next";
import { getPopular, getTopRated, mediaType } from "@/helpers/tmdb";
import MediaCard from "@/components/MediaCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Film02, Star01, ChevronLeft, ChevronRight } from "@untitledui/icons";

const TABS = [
  { key: "popular", label: "Popular", icon: Film02 },
  { key: "top_rated", label: "Top Rated", icon: Star01 },
] as const;

type Tab = (typeof TABS)[number]["key"];

export const metadata: Metadata = {
  title: "Movies",
};

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const { tab, page: pageParam } = await searchParams;
  const activeTab: Tab = tab === "top_rated" ? "top_rated" : "popular";
  const currentPage = Math.max(1, Math.min(500, Number(pageParam) || 1));

  const data =
    activeTab === "top_rated"
      ? await getTopRated("movie", currentPage)
      : await getPopular("movie", currentPage);

  const results = data.results.filter((m) => m.poster_path);
  const totalPages = Math.min(data.total_pages, 500);

  const tabLabels: Record<Tab, string> = {
    popular: "Popular Movies",
    top_rated: "Top Rated Movies",
  };

  return (
    <div className="pt-8 px-4 sm:px-8 max-w-7xl mx-auto pb-16">
      <Breadcrumbs
        items={[
          { label: "Movies", href: "/movies" },
          { label: tabLabels[activeTab] },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {tabLabels[activeTab]}
        </h1>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <Link
                key={t.key}
                href={`/movies?tab=${t.key}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-accent text-white shadow-lg shadow-accent/25"
                    : "glass glass-hover text-white/50 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {results.map((item) => (
          <div key={item.id} className="w-full">
            <MediaCard item={{ ...item, media_type: "movie" }} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {/* Previous */}
          {currentPage > 1 ? (
            <Link
              href={`/movies?tab=${activeTab}&page=${currentPage - 1}`}
              className="inline-flex items-center gap-1.5 glass glass-hover px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 glass px-4 py-2 rounded-xl text-sm text-white/20 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </span>
          )}

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {generatePageNumbers(currentPage, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-white/20 text-sm">
                  ...
                </span>
              ) : (
                <Link
                  key={p}
                  href={`/movies?tab=${activeTab}&page=${p}`}
                  className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                    p === currentPage
                      ? "bg-accent text-white shadow-lg shadow-accent/20"
                      : "glass glass-hover text-white/50 hover:text-white"
                  }`}
                >
                  {p}
                </Link>
              )
            )}
          </div>

          {/* Next */}
          {currentPage < totalPages ? (
            <Link
              href={`/movies?tab=${activeTab}&page=${currentPage + 1}`}
              className="inline-flex items-center gap-1.5 glass glass-hover px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white transition"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 glass px-4 py-2 rounded-xl text-sm text-white/20 cursor-not-allowed">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
