<div align="center">
  <img src="app/favicon.ico" alt="OnyxTV" width="64" height="64" />
  <h1>OnyxTV</h1>
  <p>A modern streaming app for discovering and watching movies and TV series.<br/>Clean dark interface. Instant search. Progress tracking. No sign-up required.</p>

  ![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white)
  ![TMDB](https://img.shields.io/badge/TMDB-API-01B4E4?logo=themoviedatabase&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-green)
</div>

---

## Preview

<div align="center">
  <img src="assets/onyxtv_preview.gif" alt="OnyxTV Preview" width="100%" />
</div>

## Disclaimer

This site does not store any media files on its server. All video content is provided by third-party services and is not hosted, uploaded, or managed by OnyxTV. I am not responsible for the content, availability, or legality of any external streams. Use at your own discretion.

## Features

- Browse trending, popular, and top-rated movies and TV shows
- Full search with instant results
- Detailed movie and TV pages with cast, seasons, and recommendations
- Built-in video player with episode navigation
- Continue watching -- tracks progress in localStorage
- Optional site-wide password lock
- Fully responsive dark UI

## Project Structure

```
app/          -- Pages and API routes
components/   -- Reusable UI components
helpers/      -- TMDB API client, utilities, watch history logic
hooks/        -- Custom React hooks (player progress, swipe)
types/        -- TypeScript interfaces (TMDB, watch history)
proxy.ts      -- Auth proxy (middleware replacement in Next.js 16)
```

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your values:
   - `TMDB_TOKEN` -- your TMDB API read access token
   - `STREAM_BASE_URL` -- base URL for the streaming embed 
   - `SITE_PASSWORD` (optional) -- set to enable the password lock screen
3. Install dependencies and run:

```bash
npm install
npm run dev
```

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS 4
- TypeScript
- TMDB API


## Next Todo

- Artist/actor profile pages with full filmography
- Director profile pages with their complete catalog
- Production company pages with all associated titles

## License
MIT