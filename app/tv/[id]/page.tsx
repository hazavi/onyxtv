import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PlayCircle, Star01, Calendar, LayersThree01 } from "@untitledui/icons";
import { getTVDetail, img, backdrop } from "@/helpers/tmdb";
import MediaRow from "@/components/MediaRow";
import CastRow from "@/components/CastRow";
import TrailerRow from "@/components/TrailerRow";
import SeasonRow from "@/components/SeasonRow";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const tv = await getTVDetail(Number(id));
    return { title: tv.name };
  } catch {
    return { title: "TV Show" };
  }
}

export default async function TVPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let tv;
  try {
    tv = await getTVDetail(Number(id));
  } catch {
    notFound();
  }

  const creators = tv.created_by?.slice(0, 3) ?? [];
  const writers = tv.credits?.crew
    ?.filter((c) => c.job === "Writer" || c.job === "Screenplay" || c.job === "Story")
    .reduce((acc, c) => {
      if (!acc.find((x) => x.id === c.id)) acc.push(c);
      return acc;
    }, [] as typeof tv.credits.crew)
    .slice(0, 3);

  const trailers = tv.videos?.results
    ?.filter((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
    .slice(0, 4);

  return (
    <>
      <div className="relative w-full h-[70vh] min-h-[400px]">
        <Image
          src={backdrop(tv.backdrop_path)}
          alt={tv.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 gradient-overlay" />
      </div>

      <div className="relative -mt-64 z-10 max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <Breadcrumbs
          items={[
            { label: "TV Shows", href: "/search?type=tv" },
            { label: tv.name },
          ]}
        />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-black/40 w-[240px]">
              <Image
                src={img(tv.poster_path, "w500")}
                alt={tv.name}
                width={240}
                height={350}
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 tracking-tight">
              {tv.name}
            </h1>

            {tv.tagline && (
              <p className="text-white/25 italic mb-4 text-sm">
                {tv.tagline}
              </p>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="badge badge-gray">
                <Star01 className="w-3 h-3" />
                {tv.vote_average?.toFixed(1)}
              </span>
              <span className="badge badge-gray">
                <Calendar className="w-3 h-3" />
                {tv.first_air_date?.slice(0, 4)}
              </span>
              <span className="badge badge-gray">
                {tv.number_of_seasons} Season{tv.number_of_seasons !== 1 ? "s" : ""}
              </span>
              <span className="badge badge-gray">
                {tv.number_of_episodes} Episodes
              </span>
              <span className="badge badge-gray">
                {tv.status}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {tv.genres?.map((g) => (
                <span
                  key={g.id}
                  className="badge badge-gray"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-white/40 leading-relaxed mb-6 text-sm max-w-2xl">
              {tv.overview}
            </p>

            {/* Creators & Writers */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 mb-6">
              {creators.length > 0 && (
                <p className="text-sm text-white/30">
                  <span className="text-white/60 font-medium">Created by</span>{" "}
                  {creators.map((c) => c.name).join(", ")}
                </p>
              )}
              {writers && writers.length > 0 && (
                <p className="text-sm text-white/30">
                  <span className="text-white/60 font-medium">Writers</span>{" "}
                  {writers.map((w) => w.name).join(", ")}
                </p>
              )}
            </div>

            <Link
              href={`/watch/tv/${tv.id}?s=1&e=1`}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-xl transition text-lg shadow-lg shadow-accent/20"
            >
              <PlayCircle className="w-5 h-5" />
              Watch S1 E1
            </Link>
          </div>
        </div>

        {/* Seasons */}
        {tv.seasons?.length > 0 && (
          <SeasonRow tvId={tv.id} seasons={tv.seasons.filter((s) => s.season_number > 0)} />
        )}

        {/* Trailers */}
        {trailers && trailers.length > 0 && (
          <TrailerRow trailers={trailers} />
        )}

        {/* Cast */}
        {tv.credits?.cast?.length > 0 && (
          <CastRow cast={tv.credits.cast.slice(0, 20)} />
        )}

        {/* Recommendations */}
        {tv.recommendations?.results?.length > 0 && (
          <div className="mt-14">
            <MediaRow
              title="You May Also Like"
              items={tv.recommendations.results.slice(0, 20)}
            />
          </div>
        )}
      </div>
    </>
  );
}
