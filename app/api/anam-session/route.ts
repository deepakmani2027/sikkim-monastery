import { NextResponse } from "next/server"

const ANAM_API_BASE = process.env.ANAM_API_BASE || "https://api.anam.ai"

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
    return NextResponse.json(
      {
        error:
          "Avatar service is not configured. Set ANAM_API_KEY and ANAM_PERSONA_ID (or ANAM_AVATAR_ID) on the server.",
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
