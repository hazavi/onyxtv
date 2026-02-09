import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PlayCircle, Star01, Clock, Calendar } from "@untitledui/icons";
import { getMovieDetail, img, backdrop } from "@/lib/tmdb";
import MediaRow from "@/components/MediaRow";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetail(Number(id));
    return { title: movie.title };
  } catch {
    return { title: "Movie" };
  }
}

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let movie;
  try {
    movie = await getMovieDetail(Number(id));
  } catch {
    notFound();
  }
  const director = movie.credits?.crew?.find((c) => c.job === "Director");

  return (
    <>
      {/* Hero backdrop */}
      <div className="relative w-full h-[70vh] min-h-[400px]">
        <Image
          src={backdrop(movie.backdrop_path)}
          alt={movie.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 gradient-overlay" />
      </div>

      <div className="relative -mt-64 z-10 max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <Breadcrumbs
          items={[
            { label: "Movies", href: "/search?type=movie" },
            { label: movie.title },
          ]}
        />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-black/40 w-[220px]">
              <Image
                src={img(movie.poster_path, "w500")}
                alt={movie.title}
                width={220}
                height={330}
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 tracking-tight">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-white/25 italic mb-4 text-sm">
                {movie.tagline}
              </p>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="badge badge-gray">
                <Star01 className="w-3 h-3" />
                {movie.vote_average?.toFixed(1)}
              </span>
              <span className="badge badge-gray">
                <Calendar className="w-3 h-3" />
                {movie.release_date?.slice(0, 4)}
              </span>
              <span className="badge badge-gray">
                <Clock className="w-3 h-3" />
                {movie.runtime} min
              </span>
              <span className="badge badge-gray">
                {movie.status}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs px-3 rounded-xl py-1.5 rounded-lg glass text-white/60"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-white/40 leading-relaxed mb-6 text-sm max-w-2xl">
              {movie.overview}
            </p>

            {director && (
              <p className="text-sm text-white/30 mb-6">
                <span className="text-white/60 font-medium">Director</span>{" "}
                {director.name}
              </p>
            )}

            <Link
              href={`/watch/movie/${movie.id}`}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-xl transition text-lg shadow-lg shadow-accent/20"
            >
              <PlayCircle className="w-5 h-5" />
              Watch Now
            </Link>
          </div>
        </div>

        {/* Cast */}
        {movie.credits?.cast?.length > 0 && (
          <section className="mt-14">
            <h2 className="text-lg font-semibold text-white mb-4 tracking-tight">Cast</h2>
            <div className="carousel-row no-scrollbar">
              {movie.credits.cast.slice(0, 15).map((c) => (
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
        {movie.recommendations?.results?.length > 0 && (
          <div className="mt-14">
            <MediaRow
              title="You May Also Like"
              items={movie.recommendations.results.slice(0, 20)}
            />
          </div>
        )}
      </div>
    </>
  );
}
