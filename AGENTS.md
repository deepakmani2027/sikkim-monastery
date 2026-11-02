# Project Guidelines

## Avatar integration

The Anam avatar uses the server-side ElevenLabs integration documented at
https://anam.ai/docs/integrations/elevenlabs/server-side-setup.md.

- Keep `ANAM_API_KEY` and `ELEVENLABS_API_KEY` server-only.
- Fetch a fresh ElevenLabs signed URL before creating each Anam session token.
- Nest `elevenLabsAgentSettings` under `environment` in the Anam token request.
- For direct Anam sessions, include `llmId` and `voiceId` in `personaConfig`;
  do not create a legacy token with only an avatar.
- The browser may receive only the session token and may use the bundled
  `@anam-ai/js-sdk`; never open an ElevenLabs WebSocket from the browser.
