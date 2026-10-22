# DharmaTech Platform

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nagmaniprasad076-7981s-projects/v0-sikkim-monasteries-app-3x)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/JPLiLzS66r5)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Original prototype deployment (legacy name) is live at:

**[https://vercel.com/nagmaniprasad076-7981s-projects/v0-sikkim-monasteries-app-3x](https://vercel.com/nagmaniprasad076-7981s-projects/v0-sikkim-monasteries-app-3x)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/JPLiLzS66r5](https://v0.app/chat/projects/JPLiLzS66r5)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository# sikkim

## Branding

Place the circular Dharma Tech logo file at `public/dharma-tech-logo.png` (recommended 512x512 PNG with transparent background). The `Logo` component, top navigation bar, and PDF exports will automatically use it. If the file is missing an emoji fallback appears. Replace the image file to update branding; name must stay the same unless you also update the import paths.

## Google Scholar search (SerpAPI proxy)

To enable researcher Google Scholar search via SerpAPI:

1. Add a `.env.local` file with:

```
SERPAPI_KEY=your_serpapi_key_here
```

2. Use the Researcher Dashboard to query. The server route `GET /api/scholar` proxies to SerpAPI `engine=google_scholar` and supports:
   - q (query), cites, as_ylo, as_yhi, scisbd, cluster

3. The UI provides year filters, recent-only toggle (scisbd), cited-by and PDF quick links.

## Google Maps Platform setup

The application uses Google Maps Platform in two environments:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is used by the browser for Maps JavaScript and Street View.
- `GOOGLE_MAPS_SERVER_API_KEY` is used by Next.js API routes for Places, Place Details, media, and Routes.

For local development, copy `.env.example` to `.env.local` and add the keys. Keep `.env.local` private. In Vercel, add both variables for **Preview** and **Production**, then redeploy.

Enable these APIs in the same Google Cloud project as the keys:

- Maps JavaScript API
- Places API (New)
- Routes API
- Geocoding API and Geolocation API if those features are used

Enable billing and restrict the browser key to the deployed site origins. Restrict the server key by API and keep it out of client-side code. The `/api/google/status` endpoint only reports whether credentials are configured; Places and Routes endpoints return their own authorization or quota errors so a Places quota problem does not disable the map or Street View.