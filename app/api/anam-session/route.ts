import { NextResponse } from "next/server"

const ANAM_API_BASE = process.env.ANAM_API_BASE || "https://api.anam.ai"
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL
const DEFAULT_PERSONA_ID = "7e20720d-abcd-49fa-b01d-3dc2feb707ee"

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected avatar session error"
}

export async function POST() {
  const anamApiKey = process.env.ANAM_API_KEY
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
  const agentId = process.env.ELEVENLABS_AGENT_ID
  const avatarId = process.env.ANAM_AVATAR_ID
  const personaId = process.env.ANAM_PERSONA_ID || avatarId
  const voiceId = process.env.ANAM_VOICE_ID
  const llmId = process.env.ANAM_LLM_ID

  if (!anamApiKey || !personaId) {
    if (BACKEND_API_URL) {
      try {
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/anam/session-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        })
        const backendData = (await backendResponse.json().catch(() => ({}))) as {
          sessionToken?: string
          detail?: string
          error?: string
        }

        if (backendResponse.ok && backendData.sessionToken) {
          return NextResponse.json({
            sessionToken: backendData.sessionToken,
            personaConfig: { personaId: personaId || DEFAULT_PERSONA_ID },
          })
        }

        console.error("[anam] Backend fallback failed:", backendData.error || backendData.detail)
      } catch (error) {
        console.error("[anam] Backend fallback request failed:", error)
      }
    }

    return NextResponse.json(
      {
        error:
          "Avatar service is not configured on the web service. Add ANAM_API_KEY and ANAM_AVATAR_ID to Railway, or configure NEXT_PUBLIC_BACKEND_URL to use the backend avatar service.",
      },
      { status: 500 },
    )
  }

  try {
    const personaConfig: Record<string, unknown> = {}
    let environment: Record<string, unknown> | undefined

    if (agentId) {
      if (!elevenLabsApiKey) {
        return NextResponse.json(
          { error: "ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID must be configured together" },
          { status: 500 },
        )
      }

      const signedUrlResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
        {
          headers: { "xi-api-key": elevenLabsApiKey },
          cache: "no-store",
        },
      )

      if (!signedUrlResponse.ok) {
        const details = await signedUrlResponse.text()
        return NextResponse.json(
          { error: `ElevenLabs API error: ${signedUrlResponse.status} ${details}` },
          { status: 502 },
        )
      }

      const { signed_url: signedUrl } = (await signedUrlResponse.json()) as {
        signed_url?: string
      }

      if (!signedUrl) {
        return NextResponse.json({ error: "ElevenLabs returned no signed URL" }, { status: 502 })
      }

      environment = {
        elevenLabsAgentSettings: {
          agentId,
          signedUrl,
        },
      }
    } else {
      personaConfig.personaId = personaId
    }

    const anamResponse = await fetch(`${ANAM_API_BASE}/v1/auth/session-token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${anamApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personaConfig,
        ...(environment ? { environment } : {}),
      }),
      cache: "no-store",
    })

    if (!anamResponse.ok) {
      const details = await anamResponse.text()
      return NextResponse.json(
        { error: `Anam API error: ${anamResponse.status} ${details}` },
        { status: 502 },
      )
    }

    const { sessionToken } = (await anamResponse.json()) as { sessionToken?: string }
    if (!sessionToken) {
      return NextResponse.json({ error: "Anam returned no session token" }, { status: 502 })
    }

    return NextResponse.json({ sessionToken, personaConfig })
  } catch (error) {
    console.error("[anam] Failed to create session:", error)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 502 })
  }
}
