import { NextResponse } from "next/server"

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID

  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY is not configured on the server" }, { status: 500 })
  }

  const body = (await request.json().catch(() => null)) as { text?: unknown } | null
  const text = typeof body?.text === "string" ? body.text.trim() : ""

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 })
  }

  if (text.length > 5000) {
    return NextResponse.json({ error: "text must be 5000 characters or fewer" }, { status: 400 })
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/${encodeURIComponent(voiceId)}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        model_id: "eleven_v3",
        text,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      const details = await response.text()
      console.error("[elevenlabs] TTS request failed:", response.status, details)
      return NextResponse.json({ error: `ElevenLabs API error: ${response.status}` }, { status: 502 })
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": response.headers.get("content-type") || "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("[elevenlabs] TTS request failed:", error)
    return NextResponse.json({ error: "Unable to generate speech" }, { status: 502 })
  }
}
