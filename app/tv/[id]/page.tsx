import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PlayCircle, Star01, Calendar, LayersThree01 } from "@untitledui/icons";
import { getTVDetail, img, backdrop } from "@/lib/tmdb";
import MediaRow from "@/components/MediaRow";
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
            <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-black/40 w-[220px]">
              <Image
                src={img(tv.poster_path, "w500")}
                alt={tv.name}
                width={220}
                height={330}
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
                <LayersThree01 className="w-3 h-3" />
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
            <div className="flex flex-wrap gap-2 mb-6">
              {tv.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs px-3 py-1.5 rounded-xl glass text-white/50"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-white/40 leading-relaxed mb-6 text-sm max-w-2xl">
              {tv.overview}
            </p>

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

        {/* Cast */}
        {tv.credits?.cast?.length > 0 && (
          <section className="mt-14">
            <h2 className="text-lg font-semibold text-white mb-4 tracking-tight">Cast</h2>
            <div className="carousel-row no-scrollbar">
              {tv.credits.cast.slice(0, 15).map((c) => (
                <div key={c.id} className="shrink-0 w-24 text-center group">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden glass mb-2 group-hover:border-white/10 transition">
                    <Image
                      src={img(c.profile_path, "w185")}
                      alt={c.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="text-[11px] font-medium text-white/70 truncate">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-white/25 truncate">
                    {c.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
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
