import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

interface ErrBody { success: false; error: string; code?: string }
function error(message: string, status = 400, code?: string) {
  const body: ErrBody = { success: false, error: message, code }
  return NextResponse.json(body, { status })
}

function isLikelyJwt(token: string) {
  if (!token) return false
  // JWT should have 3 segments separated by '.'
  const parts = token.split('.')
  if (parts.length !== 3) return false
  // Basic base64url charset check (not strict decode)
  return parts.every(p => /^[A-Za-z0-9_-]+$/.test(p) && p.length > 5)
}

function fingerprint(key: string) {
  if (!key) return 'empty'
  if (key.length < 12) return `len=${key.length}`
  return `${key.slice(0,6)}…${key.slice(-6)} (len=${key.length})`
}

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payloadB64 = parts[1]
    const json = Buffer.from(payloadB64, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json().catch(() => ({}))
    if (!email || !password || !name || !role) return error("Missing fields", 400)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const debug = process.env.DEBUG_AUTH === '1'
    if (!url || !serviceKey) return error("Server not configured", 500, "CONFIG_MISSING")

    // Enhanced validation: ensure service key looks like a JWT & typical length (Supabase service keys are usually > 100 chars)
    if (!isLikelyJwt(serviceKey) || serviceKey.length < 80) {
      if (debug) console.error('[finalize-signup] Service key failed validation fingerprint=', fingerprint(serviceKey))
      return error("Invalid service role key format", 500, "SERVICE_KEY_INVALID_FORMAT")
    }
  const payload = decodeJwtPayload(serviceKey)
  const roleClaim = payload?.role
    if (debug) console.log('[finalize-signup] service key payload role=', roleClaim)
    if (roleClaim !== 'service_role') {
      return error('Provided key is not a service role key', 500, 'SERVICE_KEY_NOT_SERVICE_ROLE')
    }

    const admin = createClient(url, serviceKey)

    // We skip a listUsers pass (can fail if key scoped oddly) and rely on createUser's duplicate error instead.

    // Create user already confirmed (since OTP was verified separately)
    if (debug) console.log('[finalize-signup] Attempting user create for', email)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role },
    })
    if (createErr) {
      const msgLower = createErr.message.toLowerCase()
      if (debug) console.error('[finalize-signup] createUser error=', createErr.message)
      if (msgLower.includes('api key')) {
        return error('Invalid service API key', 500, 'SERVICE_KEY_INVALID')
      }
      if (msgLower.includes('duplicate') || msgLower.includes('already') || msgLower.includes('exists')) {
        return error('User already exists', 409, 'USER_EXISTS')
      }
      return error(createErr.message, 500, 'USER_CREATE_FAILED')
    }
    const userId = created.user?.id
    if (!userId) return error("No user id returned", 500, 'USER_ID_MISSING')

    // Preflight: check profile table accessibility (helps detect missing migration)
    const profileCheck = await admin.from('profiles').select('id').limit(1)
    if (profileCheck.error) {
      if (debug) console.error('[finalize-signup] profiles table check failed:', profileCheck.error.message)
      return error('Profiles table unavailable. Run migration / create table.', 500, 'PROFILES_TABLE_MISSING')
    }

    // Upsert profile (id PK ensures idempotency if retried)
    const { error: profileErr } = await admin
      .from("profiles")
      .upsert({ id: userId, email, name, role }, { onConflict: "id" })
    if (profileErr) {
      if (debug) console.error('[finalize-signup] Profile upsert failed', profileErr.message)
      // If profile exists we still treat as success (avoid blocking account creation) unless it's a structural error.
      if (/duplicate|conflict|exists/i.test(profileErr.message)) {
        return NextResponse.json({ success: true, warning: 'PROFILE_DUPLICATE' })
      }
      return error(`Profile create failed: ${profileErr.message}`, 500, 'PROFILE_UPSERT_FAILED')
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    const msg = (e?.message || '').toLowerCase()
    if (process.env.DEBUG_AUTH === '1') {
      console.error('[finalize-signup] Exception', e)
    }
    if (msg.includes('api key')) {
      return error('Invalid service API key', 500, 'SERVICE_KEY_INVALID')
    }
    return error(e?.message || "Unexpected error", 500, 'UNEXPECTED')
  }
}
