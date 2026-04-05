# Sikkim Monastery Digital Experience - PRD

## Original Problem Statement
Build a Sikkim Monastery Digital Experience platform featuring "Tenzin" - a virtual Buddhist monk AI assistant. The platform showcases Sikkim's monasteries digitally with a floating chatbot widget at the bottom-right corner that has 2 modes: Chat Mode (text AI chat) and Voice Assistant Mode (with animated Anam avatar).

## Architecture
- **Backend**: Python FastAPI on port 8001
- **Frontend**: React 18 + Tailwind CSS on port 3000
- **Database**: MongoDB (monasteries collection, chat_history collection)
- **Integrations**: 
  - OpenRouter API (openai/gpt-4o-mini) for AI chat completions
  - ElevenLabs API (voice ID: fCxG8OHm4STbIsWe4aT9) for TTS in Speak mode
  - Anam AI SDK (@anam-ai/js-sdk) for real-time avatar streaming

## User Personas
- **Spiritual travelers** exploring Sikkim monasteries virtually
- **Tourists** planning trips to Sikkim seeking travel tips
- **Meditation enthusiasts** looking for guided peace and wisdom

## Core Requirements
1. Landing page with Hero, About, Gallery, Travel Tips sections
2. Floating chatbot widget with Chat/Voice tabs
3. AI-powered Tenzin monk assistant (calm, wise persona)
4. Real-time avatar streaming via Anam AI
5. Text-to-speech via ElevenLabs (in Speak mode)

## What's Been Implemented (April 2026)
- [x] Full landing page (Hero, About Sikkim, Monastery Gallery, Travel Tips, Footer)
- [x] Floating chatbot with breathing animation trigger
- [x] Chat mode with OpenRouter AI responses
- [x] Speak mode toggle (ElevenLabs TTS - API key issue on ElevenLabs side)
- [x] Voice/Avatar mode tab with Anam AI integration
- [x] 6 monasteries seeded in MongoDB
- [x] 6 travel tips endpoint
- [x] Responsive design with Cormorant Garamond + Outfit fonts
- [x] Glassmorphism chatbot widget
- [x] Scroll-reveal animations with Framer Motion

## Known Issues
- ElevenLabs TTS returns 401 (free tier usage disabled on user's account, need paid plan) - affects Chat Speak mode only, not Voice/Avatar mode
- Original avatar ID (dcc6b1be-8b8c-4aef-aac1-77a3603c318c) didn't exist in Anam - replaced with Gabriel avatar (6cc28442-cccd-42a8-b6e4-24b7210a09c5) and Sael voice (57f16c80-c60f-446b-915e-508937e957bb)

## Backlog
- P1: Add monastery detail pages with full info
- P1: Add virtual tour functionality
- P2: Multi-language support (Hindi/English)
- P2: Meditation timer/guide feature
- P2: User favorites/bookmarks for monasteries
- P3: Add more monastery images and 360-degree views
