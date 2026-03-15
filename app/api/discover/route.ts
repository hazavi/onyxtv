import { NextRequest, NextResponse } from "next/server";
import { discoverByProvider } from "@/helpers/tmdb";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") as "movie" | "tv" | null;
  const provider = searchParams.get("provider");

  if (!type || !provider || !["movie", "tv"].includes(type)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const data = await discoverByProvider(type, Number(provider));
  return NextResponse.json(data);
}
