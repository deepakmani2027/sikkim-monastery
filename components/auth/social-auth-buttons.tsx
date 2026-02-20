"use client"

import { Button } from "@/components/ui/button"
import { supabase, isSupabaseEnabled } from "@/lib/supabase"
// Inline SVG icons used instead of react-icons to avoid type issues.

export function SocialAuthButtons() {
  // Prefer an explicit production origin. If NEXT_PUBLIC_SITE_URL is set, use it.
  // If NEXT_PUBLIC_VERCEL_URL is provided (e.g. on Vercel), ensure it has a protocol.
  let publicOrigin: string | undefined = undefined
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    publicOrigin = process.env.NEXT_PUBLIC_SITE_URL
  } else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    publicOrigin = process.env.NEXT_PUBLIC_VERCEL_URL.startsWith("http")
      ? process.env.NEXT_PUBLIC_VERCEL_URL
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  } else if (typeof window !== "undefined" && window.location && window.location.hostname && !window.location.hostname.includes("localhost")) {
    // Only use window origin when it's not localhost (helps avoid accidental dev redirect in production builds)
    publicOrigin = window.location.origin
  }

  const redirectTo = `${(publicOrigin ?? (typeof window !== "undefined" ? window.location.origin : ""))}/auth/callback`

  if (typeof window !== "undefined" && (!publicOrigin || publicOrigin.includes("localhost"))) {
    // Helpful console notice for debugging — deploys should set NEXT_PUBLIC_SITE_URL or set the redirect URL in Supabase
    // eslint-disable-next-line no-console
    console.warn("[auth] NEXT_PUBLIC_SITE_URL not set — OAuth redirect may land on localhost. Set NEXT_PUBLIC_SITE_URL and add the callback URL in Supabase.")
  }

  const signIn = async (provider: "google") => {
    if (!isSupabaseEnabled() || !supabase) return
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
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


