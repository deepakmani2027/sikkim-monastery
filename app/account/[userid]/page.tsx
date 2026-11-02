"use client"

import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AccountPage({ params }: { params: { userid: string } }) {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [loading, isAuthenticated, router])

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

  if (!isAuthenticated || !user) return null

  const goProfile = () => router.push("/profile")
  const goFavorite = () => router.push("/profile/favorite")
  const doLogout = () => {
    logout()
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-semibold mb-6">Account</h1>
        <div className="grid gap-4">
          <Button onClick={goProfile} size="lg" variant="default">My Profile</Button>
          <Button onClick={goFavorite} size="lg" variant="secondary">Favorite</Button>
          <Button onClick={doLogout} size="lg" variant="destructive">Log out</Button>
        </div>
      </main>
    </div>
  )
}
