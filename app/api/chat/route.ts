import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Backend URL is not configured on the frontend server." },
      { status: 500 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ detail: "Request body must be valid JSON." }, { status: 400 })
  }

  try {
    const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const responseBody = await response.text()
    return new NextResponse(responseBody, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
    })
  } catch (error) {
    console.error("Chat backend request failed:", error)
    return NextResponse.json(
      { detail: "Unable to connect to the chat backend." },
      { status: 502 },
    )
  }
}
