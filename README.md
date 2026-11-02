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

## Anam avatar

The voice avatar uses Anam with an ElevenLabs server-side agent. Configure these
variables on the Next.js server (local `.env.local`, Vercel, or the deployment
environment), never in client-side variables:

```
ANAM_API_KEY=...
ANAM_API_BASE=https://api.anam.ai
ANAM_PERSONA_ID=...
ANAM_LLM_ID=...
ANAM_VOICE_ID=...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

When `ELEVENLABS_API_KEY` is configured, chat voice mode uses the server route
`POST /api/elevenlabs/tts` and the `eleven_v3` model. Keep the key server-only.
The avatar uses the existing Anam Lab persona configured by `ANAM_PERSONA_ID`
(or `ANAM_AVATAR_ID`). An ElevenLabs agent integration additionally requires
`ELEVENLABS_AGENT_ID`; a regular ElevenLabs TTS key does not.