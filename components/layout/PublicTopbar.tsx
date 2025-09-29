"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { ArrowRight, Map, BookOpen, LogIn, Navigation, Phone, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Logo } from "@/components/branding/Logo"

interface PublicTopbarProps {
  hideVirtualTours?: boolean
}

export function PublicTopbar({ hideVirtualTours }: PublicTopbarProps) {
  const { isAuthenticated } = useAuth()
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const sTop = window.scrollY
      const docH = document.documentElement.scrollHeight - window.innerHeight
      const pct = docH > 0 ? Math.min(100, Math.max(0, (sTop / docH) * 100)) : 0
      setProgress(pct)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <>
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
  <Logo withText withTagline size={65} responsive disableLink />

        <button
          className="md:hidden inline-flex items-center justify-center rounded-md h-10 w-10 text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Toggle menu"
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <div className="hidden md:flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="bg-transparent hover:translate-y-[-1px] transition-transform"
            onClick={() => scrollTo('explore')}
          >
            <span className="inline-flex items-center gap-1"><Map className="h-4 w-4" /> Virtual Tour</span>
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="bg-transparent hover:translate-y-[-1px] transition-transform"
            onClick={() => scrollTo('interactive-map')}
          >
            <span className="inline-flex items-center gap-1"><Navigation className="h-4 w-4" /> Interactive Map</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="bg-transparent hover:translate-y-[-1px] transition-transform"
            onClick={() => scrollTo('archives')}
          >
            <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" /> Archives</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="bg-transparent hover:translate-y-[-1px] transition-transform"
            onClick={() => scrollTo('contact')}
          >
            <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" /> Contact</span>
          </Button>
          <ThemeToggle />
          {!isAuthenticated ? (
            <Button asChild size="sm" className="ml-1 hover:shadow-md transition-transform hover:translate-y-[-1px]">
              <Link href="/auth" className="inline-flex items-center gap-1"><LogIn className="h-4 w-4" /> Sign in</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="secondary" className="ml-1 hover:shadow-md transition-transform hover:translate-y-[-1px]">
              <Link href="/dashboard" className="inline-flex items-center gap-1">Open app <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out bg-background/95 backdrop-blur border-b border-border ${open ? 'opacity-100 max-h-[480px]' : 'opacity-0 max-h-0'}`}
      >
        <div className="px-4 pt-2 pb-6 space-y-4">
          <div className="grid gap-2">
            <Button variant="ghost" className="justify-start" onClick={() => scrollTo('explore')}><Map className="h-4 w-4 mr-2" /> Virtual Tour</Button>
            <Button variant="ghost" className="justify-start" onClick={() => scrollTo('interactive-map')}><Navigation className="h-4 w-4 mr-2" /> Interactive Map</Button>
            <Button variant="ghost" className="justify-start" onClick={() => scrollTo('archives')}><BookOpen className="h-4 w-4 mr-2" /> Archives</Button>
            <Button variant="ghost" className="justify-start" onClick={() => scrollTo('contact')}><Phone className="h-4 w-4 mr-2" /> Contact</Button>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!isAuthenticated ? (
              <Button asChild className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:brightness-105">
                <Link href="/auth"><LogIn className="h-4 w-4 mr-1" /> Sign in</Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                <Link href="/dashboard">Open app <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
    {/* Spacer to offset fixed header height */}
    <div className="h-14" />
    </>
  )
}


