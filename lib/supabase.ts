import { createClient } from "@supabase/supabase-js"

// Read env vars without asserting non-null so we can run app without them.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function isValidSupabaseUrl(value: string | undefined): value is string {
  if (!value) return false

  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

const hasValidSupabaseConfig = isValidSupabaseUrl(supabaseUrl) && Boolean(supabaseAnonKey)

// Keep auth initialization independent of the browser Navigator LockManager.
// A stalled browser lock must never block the whole dashboard.
async function withAuthLock<T>(
  _name: string,
  _acquireTimeout: number,
  callback: () => Promise<T>,
): Promise<T> {
  return callback()
}

// Only create the client when the URL is valid; otherwise export null so callers can guard.
export const supabase = hasValidSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        lock: withAuthLock,
      },
    })
  : null

export function isSupabaseEnabled(): boolean {
  return hasValidSupabaseConfig
}

// Helpful console notice in dev so developers know why auth features may be disabled.
if (process.env.NODE_ENV !== "production" && !isSupabaseEnabled()) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing or invalid. Auth features are disabled. Create a .env.local file to enable them."
  )
}
