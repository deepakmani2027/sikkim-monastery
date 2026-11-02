export const runtime = "nodejs"
export const dynamic = "force-dynamic"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import crypto from "crypto"

function verify(token: string, secret: string) {
  const [b64, sig] = token.split(".")
  if (!b64 || !sig) return null
  const expected = crypto.createHmac("sha256", secret).update(b64).digest("hex")
  if (expected !== sig) return null
  try {
    const raw = Buffer.from(b64, "base64url").toString()
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const code = body?.code
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 })

  const cookie = (await cookies()).get("otp_token")?.value
  if (!cookie) return NextResponse.json({ error: "OTP expired" }, { status: 400 })
  const secret = process.env.OTP_SECRET || "dev-secret-change-me"
  const payload = verify(cookie, secret)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  if (payload.exp < Date.now()) return NextResponse.json({ error: "OTP expired" }, { status: 400 })
  if (payload.code !== code) return NextResponse.json({ error: "Incorrect code" }, { status: 400 })

  // success – clear cookie and return the verified email
  const res = NextResponse.json({ ok: true, email: payload.email }, { headers: { "cache-control": "no-store" } })
  res.cookies.set("otp_token", "", { path: "/", maxAge: 0 })
  return res
}
