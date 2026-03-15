import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, MarkerPin06 } from "@untitledui/icons";
import { getPersonDetail, img } from "@/helpers/tmdb";
import type { PersonCredit } from "@/types/tmdb";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExpandableBio from "@/components/ExpandableBio";
import CreditsTabs from "@/components/CreditsTabs";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const person = await getPersonDetail(Number(id));
    return { title: person.name };
  } catch {
    return { title: "Person" };
  }
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getAge(birthday: string | null, deathday: string | null) {
  if (!birthday) return null;
  const born = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - born.getFullYear();
  const m = end.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < born.getDate())) age--;
  return age;
}

function dedupe(credits: PersonCredit[]) {
  const seen = new Set<number>();
  return credits.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let person;
  try {
    person = await getPersonDetail(Number(id));
  } catch {
    notFound();
  }

  const age = getAge(person.birthday, person.deathday);

  const actingCredits = dedupe(
    person.combined_credits.cast
      .sort((a, b) => b.popularity - a.popularity)
  );

  const crewCredits = dedupe(
    person.combined_credits.crew
      .sort((a, b) => b.popularity - a.popularity)
  );

  const movieCredits = actingCredits.filter((c) => c.media_type === "movie");
  const tvCredits = actingCredits.filter((c) => c.media_type === "tv");

  return (
    <>
      <div className="relative -mt-4 z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-28 pb-16">
        <Breadcrumbs
          items={[
            { label: "Person" },
            { label: person.name },
          ]}
        />

        <div className="flex flex-col md:flex-row gap-8 md:items-start">
          {/* Photo */}
          <div className="shrink-0">
            <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-black/40 w-[240px]">
              <Image
                src={img(person.profile_path, "w500")}
                alt={person.name}
                width={240}
                height={360}
                className="object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 tracking-tight">
              {person.name}
            </h1>

            <p className="text-white/40 text-sm mb-4">
              {person.known_for_department}
            </p>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {person.birthday && (
                <span className="badge badge-gray">
                  <Calendar className="w-3 h-3" />
                  {formatDate(person.birthday)}
                  {age !== null && !person.deathday && ` (${age})`}
                </span>
              )}
              {person.deathday && (
                <span className="badge badge-gray">
                  Died {formatDate(person.deathday)} ({age})
                </span>
              )}
              {person.place_of_birth && (
                <span className="badge badge-gray">
                  <MarkerPin06 className="w-3 h-3" />
                  {person.place_of_birth}
                </span>
              )}
            </div>

            {/* Biography */}
            {person.biography && (
              <ExpandableBio text={person.biography} />
            )}

            {/* Also known as */}
            {person.also_known_as.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-white/30">
                  <span className="text-white/60 font-medium">Also known as</span>{" "}
                  {person.also_known_as.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        <CreditsTabs
          tabs={[
            { label: "Movies", credits: movieCredits },
            { label: "TV Shows", credits: tvCredits },
            ...(person.known_for_department !== "Acting" && crewCredits.length > 0
              ? [{ label: `As ${person.known_for_department}`, credits: crewCredits }]
              : []),
          ]}
        />
      </div>
    </>
  );
}
