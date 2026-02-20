"use client"

import { Button } from "@/components/ui/button"
import { supabase, isSupabaseEnabled } from "@/lib/supabase"
// Inline SVG icons used instead of react-icons to avoid type issues.

export function SocialAuthButtons() {
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined

  const signIn = async (provider: "google" | "twitter") => {
    if (!isSupabaseEnabled() || !supabase) return
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => signIn("google")}
  className="group flex-1 h-11 rounded-xl border-yellow-300/60 bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-200 text-neutral-800 font-medium shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
      >
        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-60 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45),transparent_60%)] transition-opacity" />
        <span className="relative z-10 inline-flex items-center justify-center gap-2 text-sm sm:text-base tracking-wide">
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 11v3.6h5.09c-.22 1.3-.92 2.4-1.96 3.14l3.17 2.46c1.85-1.7 2.91-4.2 2.91-7.2 0-.7-.06-1.37-.18-2H12z"/>
            <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.17-2.46c-.88.6-2 1-3.44 1-2.65 0-4.9-1.8-5.71-4.22H3.02v2.56A10 10 0 0 0 12 22z"/>
            <path fill="#FBBC05" d="M6.29 13.88A6 6 0 0 1 5.96 12c0-.65.11-1.28.32-1.88V7.56H3.02A10 10 0 0 0 2 12c0 1.6.38 3.1 1.02 4.44l3.27-2.56z"/>
            <path fill="#4285F4" d="M12 6.58c1.47 0 2.78.5 3.81 1.47l2.86-2.86C16.95 3.9 14.7 3 12 3a10 10 0 0 0-8.98 5.56l3.27 2.56C7.1 8.38 9.35 6.58 12 6.58z"/>
          </svg>
          <span>Continue with Google</span>
        </span>
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => signIn("twitter")}
  className="group flex-1 h-11 rounded-xl border-yellow-300/60 bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-200 text-neutral-800 font-medium shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
      >
        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-60 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.45),transparent_60%)] transition-opacity" />
        <span className="relative z-10 inline-flex items-center justify-center gap-2 text-sm sm:text-base tracking-wide">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2h3.308l-7.227 8.26L24 22h-6.602l-5.17-6.766L6.1 22H2.79l7.73-8.842L0 2h6.796l4.713 6.231L18.244 2Zm-1.161 17.94h1.833L7.084 3.94H5.117l11.966 16Z" />
          </svg>
          <span>Continue with Twitter</span>
        </span>
      </Button>
    </div>
  )
}


