"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase, isSupabaseEnabled } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Single clean implementation for Google-only social sign-in.
export function SocialAuthButtons() {
  const searchParams = useSearchParams()
  const returnTo = searchParams?.get("returnTo") || "/dashboard"
  const [loadingProvider, setLoadingProvider] = useState<"google" | null>(null)
  const [showHelpFor, setShowHelpFor] = useState<"google" | null>(null)

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`
      : undefined

  const signIn = async (provider: "google") => {
    if (!isSupabaseEnabled() || !supabase) {
      toast.error("Auth is not configured. Add Supabase env vars in .env.local.")
      return
    }

    setLoadingProvider(provider)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      })

      if (error) {
        const msg = (error.message || "").toLowerCase()
        if (msg.includes("provider is not enabled") || msg.includes("unsupported provider")) {
          setShowHelpFor("google")
          toast.error("Google sign-in is not enabled in Supabase.")
        } else {
          toast.error(error.message || "OAuth sign-in failed")
        }
        return
      }

      if (!data?.url) {
        toast.error("Unable to start OAuth flow. Provider URL missing.")
        return
      }

      window.location.assign(data.url)
    } finally {
      setLoadingProvider(null)
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const projectRef = (() => {
    try {
      return supabaseUrl ? new URL(supabaseUrl).hostname.split(".")[0] : ""
    } catch {
      return ""
    }
  })()
  const dashboardProvidersUrl = projectRef
    ? `https://app.supabase.com/project/${projectRef}/authentication/providers`
    : `https://app.supabase.com`
  const callbackExample = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "/auth/callback"

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Copy failed")
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
        <Button
          type="button"
          variant="outline"
          disabled={loadingProvider !== null}
          onClick={() => signIn("google")}
          className="group flex-1 h-11 rounded-xl border-yellow-300/60 bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-200 text-neutral-800 font-medium shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-60 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45),transparent_60%)] transition-opacity" />
          <span className="relative z-10 inline-flex items-center justify-center gap-3 text-sm sm:text-base tracking-wide w-full px-3">
            <img src="/google-icon-logo-svgrepo-com.svg" alt="Google" className="h-5 w-5" />
            <span className="flex-1 text-sm sm:text-base font-medium text-neutral-900">Continue with Google</span>
            {loadingProvider === "google" && <Loader2 className="h-4 w-4 animate-spin" />}
          </span>
        </Button>
      </div>

      {showHelpFor && (
        <div className="mt-3 rounded-md border p-3 bg-muted-foreground/5 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <strong className="block">Google provider not enabled</strong>
              <p className="text-muted-foreground mt-1">Enable the provider in your Supabase project and add the callback URL below.</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  Open Supabase Providers: <a className="underline" href={dashboardProvidersUrl} target="_blank" rel="noreferrer">Open provider settings</a>
                </li>
                <li>Set OAuth Client ID & Secret in Supabase</li>
                <li>
                  Add redirect URI: <code className="bg-background px-1 rounded">{callbackExample}</code>
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="btn" onClick={() => copy(callbackExample)}>Copy callback URL</button>
              <button className="btn" onClick={() => window.open(dashboardProvidersUrl, "_blank")}>Open Supabase</button>
              <button className="text-sm text-muted-foreground" onClick={() => setShowHelpFor(null)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}