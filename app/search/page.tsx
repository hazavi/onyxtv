import Link from "next/link";
import type { Metadata } from "next";
import { searchMulti, getPopular, mediaType } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;
  const query = q || "";
  const filterType = type || "";

  let results: any[];
  let title: string;

  if (query) {
    const data = await searchMulti(query);
    results = data.results.filter(
      (m) =>
        (m.media_type === "movie" || m.media_type === "tv") &&
        m.poster_path &&
        (!filterType || m.media_type === filterType)
    );
    title = `Results for "${query}"`;
  } else if (filterType === "movie") {
    const data = await getPopular("movie");
    results = data.results;
    title = "Popular Movies";
  } else if (filterType === "tv") {
    const data = await getPopular("tv");
    results = data.results;
    title = "Popular TV Shows";
  } else {
    results = [];
    title = "Browse";
  }

  return (
    <div className="pt-8 px-4 sm:px-8 max-w-7xl mx-auto pb-16">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Browse", href: "/search" },
          ...(query ? [{ label: `"${query}"` }] : []),
          ...(filterType && !query
            ? [{ label: filterType === "movie" ? "Movies" : "TV Shows" }]
            : []),
        ]}
      />

      {/* Header with filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5">
          <Link
            href={query ? `/search?q=${query}` : "/search"}
            className={`badge badge-gray hover:opacity-80 transition ${!filterType ? "!bg-white/15 !border-white/20 !text-white" : ""}`}
          >
            All
          </Link>
          <Link
            href={query ? `/search?q=${query}&type=movie` : "/search?type=movie"}
            className={`badge badge-gray hover:opacity-80 transition ${filterType === "movie" ? "!bg-white/15 !border-white/20 !text-white" : ""}`}
          >
            Movies
          </Link>
          <Link
            href={query ? `/search?q=${query}&type=tv` : "/search?type=tv"}
            className={`badge badge-gray hover:opacity-80 transition ${filterType === "tv" ? "!bg-white/15 !border-white/20 !text-white" : ""}`}
          >
            TV Shows
          </Link>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-24">
          <div className="glass rounded-2xl inline-block px-8 py-12">
            <p className="text-white/30 text-sm">
              {query
                ? "No results found. Try a different search."
                : "Use the search to find movies and TV shows."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Results count */}
          <p className="text-xs text-white/30 mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item) => (
              <div key={`${mediaType(item)}-${item.id}`} className="w-full">
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
