"use client"

import { Button } from "@/components/ui/button"
import { supabase, isSupabaseEnabled } from "@/lib/supabase"
// Inline SVG icons used instead of react-icons to avoid type issues.

export function SocialAuthButtons() {
  const publicOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL
  const redirectTo = typeof window !== "undefined"
    ? `${publicOrigin ?? window.location.origin}/auth/callback`
    : publicOrigin

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


