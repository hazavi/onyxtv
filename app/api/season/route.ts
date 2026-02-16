import { NextRequest, NextResponse } from "next/server";
import { getSeasonDetail } from "@/helpers/tmdb";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tvId = Number(searchParams.get("tvId"));
  const season = Number(searchParams.get("season"));

  if (!tvId || !season) {
    return NextResponse.json(
      { error: "tvId and season are required" },
      { status: 400 }
    );
  }

  const key = `${tvId}-${season}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  }

  try {
    const data = await getSeasonDetail(tvId, season);
    cache.set(key, { data, ts: Date.now() });
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch season" },
      { status: 500 }
    );
  }
}
