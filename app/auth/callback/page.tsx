"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseEnabled } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isSupabaseEnabled() || !supabase) {
      router.replace("/auth?error=auth_disabled")
      return
    }

    let mounted = true

    ;(async () => {
      try {
        // Give the Supabase client a short moment to detect the session in the URL
        await new Promise((r) => setTimeout(r, 250))

        // Try to read the session (the client may have already processed the URL)
        const { data } = await supabase.auth.getSession()

        // Remove any hash from the URL so users don't end up on /dashboard#...
        if (typeof window !== "undefined") {
          const cleanUrl = window.location.origin + window.location.pathname + window.location.search
          window.history.replaceState({}, document.title, cleanUrl)
        }

        if (!mounted) return

        if (data?.session) {
          router.replace("/dashboard")
        } else {
          router.replace("/auth?error=callback")
        }
      } catch (err) {
        router.replace("/auth?error=callback")
      }
    })()

    return () => {
      mounted = false
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Processing sign-in…</div>
    </div>
  )
}
