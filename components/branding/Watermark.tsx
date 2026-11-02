"use client"
import Image from "next/image"
import React from "react"

/**
 * Global subtle watermark using the main brand image.
 * Positioned fixed and pointer-events-none so it never blocks UI.
 */
export function Watermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-50 flex items-center justify-center select-none"
      style={{
        opacity: 'var(--wm-opacity, 0.05)'
      }}
    >
      <div
        className="relative aspect-square"
        style={{
          width: 'var(--wm-size, 95vmin)',
          maxWidth: 'var(--wm-max, 1200px)'
        }}
      >
        <Image
          src="/darma.png"
          alt="DharmaTech watermark"
          fill
          sizes="(max-width: 1200px) 95vmin, 1200px"
          className="object-contain mix-blend-luminosity dark:mix-blend-overlay"
          priority
        />
      </div>
    </div>
  )
}
