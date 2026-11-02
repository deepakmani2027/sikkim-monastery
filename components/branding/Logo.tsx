"use client"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import React from "react"

interface LogoProps {
  variant?: "mountain" | "temple"
  withText?: boolean
  withTagline?: boolean
  size?: number
  responsive?: boolean // if true, scales up on sm/md breakpoints
  className?: string
  href?: string
  disableLink?: boolean // if true, renders just the visual without wrapping Link
}

// Uses Dharma Tech circular logo image. Falls back to emoji if image missing.
export function Logo({
  variant = "temple",
  withText = false,
  withTagline = false,
  size = 40,
  responsive = false,
  className,
  href = "/dashboard",
  disableLink = false
}: LogoProps) {
  const boxPx = `${size}px`
  const logoSrc = "/darma.png" // place this file in /public
  const fallbackEmoji = variant === "mountain" ? "🏔️" : "🏛️"

  const sizeClasses = responsive ? "sm:w-[52px] sm:h-[52px] md:w-[50px] md:h-[50px]" : ""
  const content = (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-background/0 font-medium transition-transform hover:rotate-1 hover:scale-105",
        sizeClasses,
        className
      )}
      style={{ width: boxPx, height: boxPx }}
    >
      <Image
        src={logoSrc}
        alt="App Logo"
        width={size}
        height={size}
        className="object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const fb = target.parentElement?.querySelector('[data-fallback]') as HTMLElement | null
          if (fb) fb.style.display = 'flex'
        }}
        priority
      />
      <span
        data-fallback
        className="hidden w-full h-full items-center justify-center rounded-xl bg-primary text-primary-foreground"
        style={{ fontSize: Math.round(size * 0.6) }}
      >
        {fallbackEmoji}
      </span>
    </span>
  )

  const inner = (
    <>
      {content}
      {withText && (
        <div className="leading-tight">
          <div className="font-bold text-xl tracking-tight group-hover:opacity-95">DharmaTech</div>
          {withTagline && (
            <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">Connecting Sikkim to the World</div>
          )}
        </div>
      )}
    </>
  )

  if (disableLink) {
    return (
      <span className={cn("inline-flex items-center gap-3 group", !withText && "inline-flex", className)} aria-label="DharmaTech Logo">
        {inner}
      </span>
    )
  }

  return (
    <Link href={href} aria-label="DharmaTech Home" className={cn("flex items-center gap-3 group", !withText && "inline-flex", className)}>
      {inner}
    </Link>
  )
}
