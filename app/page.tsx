import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getAiringToday,
} from "@/lib/tmdb";
import HeroBanner from "@/components/HeroBanner";
import MediaRow from "@/components/MediaRow";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";

export const revalidate = 3600;

export default async function Home() {
  const [trending, popularMovies, popularTV, topMovies, topTV, nowPlaying, airingToday] =
    await Promise.all([
      getTrending("all", "week"),
      getPopular("movie"),
      getPopular("tv"),
      getTopRated("movie"),
      getTopRated("tv"),
      getNowPlaying(),
      getAiringToday(),
    ]);

  const trendingFiltered = trending.results.filter(
    (m) => (m.media_type === "movie" || m.media_type === "tv") && m.backdrop_path
  );

  const heroItems = trendingFiltered.slice(0, 10);

  return (
    <>
      <HeroBanner items={heroItems} />

      <div className="relative z-10 px-4 sm:px-8 max-w-[1400px] mx-auto pt-8 pb-16">
        <ContinueWatchingRow />
        <MediaRow
          title="Top 10 This Week"
          items={trendingFiltered.slice(0, 10)}
          ranked
        />
        <MediaRow
          title="Popular Movies"
          items={popularMovies.results.slice(0, 20)}
        />
        <MediaRow
          title="Popular TV Shows"
          items={popularTV.results.slice(0, 20)}
        />
        <MediaRow
          title="Top Rated Movies"
          items={topMovies.results.slice(0, 20)}
        />
        <MediaRow
          title="Top Rated TV"
          items={topTV.results.slice(0, 20)}
        />
        <MediaRow
          title="Now Playing"
          items={nowPlaying.results.slice(0, 20)}
        />
        <MediaRow
          title="Airing Today"
          items={airingToday.results.slice(0, 20)}
        />
      </div>
    </>
  );
}
