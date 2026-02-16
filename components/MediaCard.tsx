import Image from "next/image";
import Link from "next/link";
import { Star, Play, Calendar } from "lucide-react";
import { TMDBMedia, img, mediaTitle, mediaType, mediaYear } from "@/helpers/tmdb";

export default function MediaCard({
  item,
  rank,
}: {
  item: TMDBMedia;
  rank?: number;
}) {
  const type = mediaType(item);
  const href = `/${type}/${item.id}`;
  const title = mediaTitle(item);
  const rating = item.vote_average?.toFixed(1);
  const year = mediaYear(item);

  /* ─── Top 10 card (bigger) ─── */
  if (rank !== undefined) {
    return (
      <Link
        href={href}
        className="group shrink-0 flex items-end gap-0 transition-transform duration-300 hover:scale-[1.03]"
      >
        <span className="rank-number select-none">{rank}</span>
        <div
          className="relative rounded-xl overflow-hidden shadow-lg shadow-black/40 w-[140px] sm:w-[165px] md:w-[185px] aspect-[2/3]"
        > 
          <Image
            src={img(item.poster_path, "w342")}
            alt={title}
            fill
            sizes="(max-width: 640px) 140px, (max-width: 768px) 165px, 185px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black from-20% via-black/80 via-50% to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col">
            {/* Play button centered */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-accent/90 flex items-center justify-center shadow-lg shadow-accent/30">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            {/* Info at bottom */}
            <div className="p-3 pt-0">
              <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                {title}
              </p>
              {item.overview && (
                <p className="text-[10px] text-white/30 line-clamp-2 mt-1 leading-relaxed">
                  {item.overview}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="badge badge-gray shadow-md text-[10px] py-0 px-1.5">{type.toUpperCase()}</span>
                <span className="flex items-center gap-0.5 text-[11px] text-white/50">
                  <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                  {rating}
                </span>
                <span className="text-[11px] text-white/30">{year}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ─── Regular card ─── */
  return (
    <Link
      href={href}
      className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30 shrink-0 w-[130px] sm:w-[155px] md:w-[175px]"
    >
      <div className="relative aspect-[2/3] bg-white/[0.02] rounded-xl overflow-hidden border border-white/[0.04] group-hover:border-white/[0.1] transition-colors">
        <Image
          src={img(item.poster_path, "w342")}
          alt={title}
          fill
          sizes="(max-width: 640px) 130px, (max-width: 768px) 155px, 175px"
          className="object-cover"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black from-25% via-black/80 via-55% to-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col">
          {/* Play button centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-accent/90 flex items-center justify-center shadow-lg shadow-accent/30">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
          {/* Info at bottom */}
          <div className="p-3 pt-0">
            <p className="text-[12px] sm:text-[13px] font-semibold text-white line-clamp-2 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {title}
            </p>
            {item.overview && (
              <p className="text-[10px] text-white/30 line-clamp-2 mt-1 leading-relaxed">
                {item.overview}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="badge badge-gray text-[10px] py-0 px-1.5">{type.toUpperCase()}</span>
              <span className="flex items-center gap-0.5 text-[11px] text-white/50">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                {rating}
              </span>
              <span className="flex items-center gap-0.5 text-[11px] text-white/30">
                <Calendar className="w-2.5 h-2.5" />
                {year}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
