"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth?returnTo=/profile")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  const roleBadge = {
    tourist: "bg-primary/10 text-primary",
    researcher: "bg-secondary/10 text-secondary",
    admin: "bg-accent/10 text-accent",
  }[user.role]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Welcome, {user.name}</h1>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${roleBadge}`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
        </div>

        <div className="grid gap-3">
          <Button asChild variant="secondary" className="justify-start h-12 text-base">
            <Link href="/search">Search</Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start h-12 text-base">
            <Link href="/digital-archives">Digital Archives</Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start h-12 text-base">
            <Link href="/virtual-tours">Virtual Tours</Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start h-12 text-base">
            <Link href="/profile/favorite">Favorite</Link>
          </Button>
          <Button variant="ghost" className="justify-start h-12 text-base text-destructive" onClick={logout}>
            Sign out
          </Button>
        </div>
      </main>
    </div>
  )
}
