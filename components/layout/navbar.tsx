"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, User, Menu } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Logo } from "@/components/branding/Logo"
 

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const canSeeArchives = user?.role === "researcher" || user?.role === "admin"
  const canSee = user?.role === "tourist" 

  const getRoleColor = (role: string) => {
    switch (role) {
      case "tourist":
        return "text-primary"
      case "researcher":
        return "text-secondary"
      case "admin":
        return "text-accent"
      default:
        return "text-foreground"
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "tourist":
        return "bg-primary/10 text-primary"
      case "researcher":
        return "bg-secondary/10 text-secondary"
      case "admin":
        return "bg-accent/10 text-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link href="/dashboard" className="flex items-center space-x-4">
            <Logo size={56} responsive disableLink />
            <div>
              <h1 className="text-xl font-bold text-card-foreground">DharmaTech</h1>
              <p className="text-xs text-muted-foreground">Connecting Sikkim to the World</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>Welcome, {user.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            )}

              {canSee && (
              <Button asChild variant="ghost" size="sm" className="flex items-center space-x-2">
                <Link href="/search">
                  <span className="hidden sm:inline">Search</span>
                </Link>
              </Button>
              )}
              {canSeeArchives && (
                <Button asChild variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Link href="/digital-archives">
                    <span className="hidden sm:inline">Digital Archives</span>
                  </Link>
                </Button>
              )}
              {canSee && (
              <Button asChild variant="ghost" size="sm" className="flex items-center space-x-2">
                <Link href="/virtual-tours">
                  <span className="hidden sm:inline">Virtual Tours</span>
                </Link>
              </Button>
              )}
              <ThemeToggle />
              <Button asChild variant="ghost" size="sm" className="flex items-center space-x-2">
                <Link href={user ? `/account/${user.id}` : "/auth"}>
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </Link>
              </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border pt-4 pb-4">
            {user && (
              <div className="flex flex-col space-y-2 mb-4">
                <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>Welcome, {user.name}</span>
                <span className={`self-start px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            )}
            {user?.role === "admin" && (
              <Button asChild variant="ghost" size="sm" className="w-full justify-start mb-2">
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}
            {user?.role === "tourist" && (
              <>
                <Button asChild variant="ghost" size="sm" className="w-full justify-start mb-2">
                  <Link href="/search">Search</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full justify-start mb-2">
                  <Link href="/virtual-tours">Virtual Tours</Link>
                </Button>
              </>
            )}
            {user?.role === "researcher" && (
              <Button asChild variant="ghost" size="sm" className="w-full justify-start mb-2">
                <Link href="/digital-archives">Digital Archives</Link>
              </Button>
            )}
            {user && (
              <>
                <Button asChild variant="ghost" size="sm" className="w-full justify-start mb-2">
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full justify-start mb-2">
                  <Link href="/profile/favorite">Favorite</Link>
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
