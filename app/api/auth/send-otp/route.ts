import { NextResponse } from "next/server"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
import nodemailer from "nodemailer"
import crypto from "crypto"

function sign(data: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex")
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const code = (Math.floor(100000 + Math.random() * 900000)).toString()
    const ttlMs = 10 * 60 * 1000 // 10 minutes
    const payload = { email, code, exp: Date.now() + ttlMs }
    const raw = JSON.stringify(payload)
    const b64 = Buffer.from(raw).toString("base64url")
    const secret = process.env.OTP_SECRET || "dev-secret-change-me"
    const sig = sign(b64, secret)
    const token = `${b64}.${sig}`

    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const fromEmail = process.env.SMTP_SENDER_EMAIL || user
  const fromName = process.env.SMTP_SENDER_NAME || "DharmaTech"
    const dryRun = (process.env.SMTP_DRY_RUN || "").toString().trim() === "1" || (process.env.SMTP_DRY_RUN || "").toString().toLowerCase() === "true"

    // Development helper: allow bypassing SMTP to unblock local testing
    if (dryRun) {
      console.log("[OTP DRY RUN] Would send code %s to %s", code, email)
      const res = NextResponse.json({ ok: true, dryRun: true }, { headers: { "cache-control": "no-store" } })
      res.cookies.set("otp_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: Math.ceil(ttlMs / 1000),
      })
      return res
    }

    if (!host || !user || !pass) {
      return NextResponse.json({ error: "SMTP not configured" }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    const subject = "Your verification code"
    const html = `
      <div style="font-family:system-ui,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;margin:auto;padding:24px">
        <h2 style="margin:0 0 12px;color:#111">DharmaTech</h2>
        <p style="margin:0 0 16px;color:#333">Use the code below to verify your email. It expires in 10 minutes.</p>
        <div style="font-size:32px;letter-spacing:6px;font-weight:700;background:#f7f7f7;padding:12px 16px;border-radius:10px;text-align:center">${code}</div>
        <p style="margin-top:16px;color:#666;font-size:12px">If you didn't request this, you can ignore this email.</p>
      </div>`

    await transporter.sendMail({
      to: email,
      from: `${fromName} <${fromEmail}>`,
      subject,
      html,
    })

    const res = NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } })
    res.cookies.set("otp_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.ceil(ttlMs / 1000),
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to send OTP" }, { status: 500 })
  }
}
