import type { Metadata } from "next";
import { getTVDetail } from "@/lib/tmdb";
import TVWatchClient from "@/components/TVWatchClient";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const tv = await getTVDetail(Number(id));
    return { title: `Watch ${tv.name}` };
  } catch {
    return { title: "Watch" };
  }
}

export default async function WatchTVPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tv = await getTVDetail(Number(id));

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-white/30">
          <span className="text-sm">Loading...</span>
        </div>
      }
    >
      <TVWatchClient tv={tv} />
    </Suspense>
  );
}
