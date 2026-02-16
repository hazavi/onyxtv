import type { Metadata } from "next";
import { getMovieDetail } from "@/helpers/tmdb";
import MovieWatchClient from "@/components/MovieWatchClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetail(Number(id));
    return { title: `Watch ${movie.title}` };
  } catch {
    return { title: "Watch" };
  }
}

export default async function WatchMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovieDetail(Number(id));

  return (
    <div className="min-h-screen">
      <MovieWatchClient movie={movie} />
    </div>
  );
}
