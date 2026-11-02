"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { useAuth } from "@/hooks/use-auth"
import { AUTH_BG_IMAGES } from "@/lib/authBackgrounds"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams?.get("returnTo") || "/dashboard"

  // Background indices
  const [bgIndex, setBgIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)

  // Redirect when authenticated (respect returnTo)
  useEffect(() => {
    if (isAuthenticated && !loading) router.push(returnTo)
  }, [isAuthenticated, loading, router, returnTo])

  // Cycle backgrounds with slide-blur transition
  useEffect(() => {
    const total = AUTH_BG_IMAGES.length
    if (!total) return
    const interval = setInterval(() => {
      setBgIndex((i) => {
        setPrevIndex(i)
        return (i + 1) % total
      })
    }, 6500)
    return () => clearInterval(interval)
  }, [])

  const total = AUTH_BG_IMAGES.length
  const hasImages = total > 0
  const currentBg = hasImages ? AUTH_BG_IMAGES[bgIndex % total] : ""
  const prevBg = prevIndex != null && hasImages ? AUTH_BG_IMAGES[prevIndex % total] : null
  const nextIndex = hasImages ? (bgIndex + 1) % total : 0
  const nextBg = hasImages ? AUTH_BG_IMAGES[nextIndex] : undefined

  // Preload next
  useEffect(() => {
    if (!nextBg) return
    const img = new Image()
    img.src = nextBg
  }, [nextBg])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) return null

  const inClass = "auth-slide-in"
  const outClass = "auth-slide-out"

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* New (current) background */}
      <div
        key={`curr-${bgIndex}`}
        className={`absolute inset-0 bg-cover bg-center will-change-transform auth-kenburns ${inClass}`}
        style={{ backgroundImage: `url(${currentBg})` }}
      />
      {/* Previous background animating out */}
      {prevBg && (
        <div
          key={`prev-${prevIndex}`}
          className={`absolute inset-0 bg-cover bg-center ${outClass}`}
          style={{ backgroundImage: `url(${prevBg})` }}
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <SocialAuthButtons />
          </div>
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <SignupForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  )
}
