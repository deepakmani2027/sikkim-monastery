"use client"

import { Button } from "@/components/ui/button"
import { supabase, isSupabaseEnabled } from "@/lib/supabase"
// Inline SVG icons used instead of react-icons to avoid type issues.

export function SocialAuthButtons() {
  // Determine production origin (priority: NEXT_PUBLIC_SITE_URL -> NEXT_PUBLIC_VERCEL_URL -> window.origin if not localhost -> explicit fallback)
  let publicOrigin: string
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0) {
    publicOrigin = process.env.NEXT_PUBLIC_SITE_URL
  } else if (process.env.NEXT_PUBLIC_VERCEL_URL && process.env.NEXT_PUBLIC_VERCEL_URL.length > 0) {
    publicOrigin = process.env.NEXT_PUBLIC_VERCEL_URL.startsWith('http')
      ? process.env.NEXT_PUBLIC_VERCEL_URL
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  } else if (typeof window !== 'undefined' && window.location && window.location.hostname && !window.location.hostname.includes('localhost')) {
    publicOrigin = window.location.origin
  } else {
    publicOrigin = 'https://dharma-tech.vercel.app'
  }

  const redirectTo = `${publicOrigin}/auth/callback`

  if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL.includes('localhost'))) {
    // eslint-disable-next-line no-console
    console.warn('[auth] NEXT_PUBLIC_SITE_URL not set or points to localhost — using fallback domain for OAuth redirect:', redirectTo)
  }

  const signIn = async (provider: 'google') => {
    if (!isSupabaseEnabled() || !supabase) return
    // Log redirect target for debugging in browser console
    if (typeof window !== 'undefined') console.debug('[auth] starting OAuth for', provider, 'redirectTo=', redirectTo)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => signIn("google")}
        className="group flex-1 h-12 rounded-xl border border-gray-200 bg-white text-neutral-900 font-semibold shadow-sm hover:shadow-lg transition-transform duration-150 transform hover:-translate-y-0.5 flex items-center justify-center gap-3 px-4"
      >
        <span className="relative z-10 inline-flex items-center gap-3">
          <img src="/google-icon-logo-svgrepo-com.svg" alt="Google" className="h-5 w-5" />
          <span className="text-sm sm:text-base tracking-wide">Continue with Google</span>
        </span>
      </Button>
      {/* Twitter login removed */}
    </div>
  )
}