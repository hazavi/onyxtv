import { NextRequest, NextResponse } from "next/server";
import { verifyStreamToken } from "@/helpers/crypto";

const STREAM_BASE = process.env.STREAM_BASE_URL;
const COOKIE_NAME = "onyxtv_auth";

/**
 * Secure stream proxy route.
 *
 * Returns a minimal HTML page that embeds the real player iframe.
 * Because the browser sees /api/stream as the iframe src (our domain),
 * the real streaming domain is never exposed in the parent page's
 * Elements, Sources, or Application tabs.
 */
export async function GET(request: NextRequest) {
  /* ── Auth gate ── */
  const sitePassword = process.env.SITE_PASSWORD;
  if (sitePassword) {
    const authCookie = request.cookies.get(COOKIE_NAME);
    if (authCookie?.value !== sitePassword) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  /* ── Validate params ── */
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  if (!type || !id || !token || !STREAM_BASE) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const tmdbId = Number(id);
  if (Number.isNaN(tmdbId)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  if (!verifyStreamToken(type, tmdbId, token)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  /* ── Build real stream URL ── */
  let streamUrl: string;

  if (type === "movie") {
    streamUrl = `${STREAM_BASE}/movie/${tmdbId}?autoPlay=true&title=false&hideServer=true&chromecast=false&theme=FF0000`;
  } else if (type === "tv") {
    const season = searchParams.get("s") || "1";
    const episode = searchParams.get("e") || "1";
    streamUrl = `${STREAM_BASE}/tv/${tmdbId}/${season}/${episode}?autoPlay=true&nextButton=false&autoNext=false&title=false&hideServer=true&chromecast=false&theme=FF0000`;
  } else {
    return new NextResponse("Bad Request", { status: 400 });
  }

  /* ── Return an HTML wrapper that embeds the player ──
   *  This avoids a 302 redirect so the streaming domain never
   *  appears in the parent page's DevTools Elements / Network.
   *  The inner iframe loads inside *this* document context.
   */

  // Base64-encode the URL so it doesn't appear as a plain string in the HTML source
  const encoded = Buffer.from(streamUrl).toString("base64");

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer">
<style>*{margin:0;padding:0;overflow:hidden}html,body{width:100%;height:100%;background:#000}iframe{width:100%;height:100%;border:none}</style>
</head><body>
<script>
(function(){
  var d=atob("${encoded}");
  var f=document.createElement("iframe");
  f.src=d;
  f.setAttribute("allow","autoplay; fullscreen; picture-in-picture");
  f.setAttribute("referrerpolicy","no-referrer");
  document.body.appendChild(f);
})();
</script>
</body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
