"use client"

import { useEffect, useRef } from "react"

type Props = {
  iiif?: string
  image?: string
  height?: number
  onReady?: (viewer: any) => void
}

// OpenSeadragon is loaded dynamically to avoid SSR issues
export default function HighResViewer({ iiif, image, height = 400, onReady }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let viewer: any
    let mounted = true
    async function load() {
      const OpenSeadragon = (await import("openseadragon")).default
      if (!mounted || !elRef.current) return
      const opts: any = {
        element: elRef.current,
        showNavigator: true,
        navigatorPosition: "BOTTOM_RIGHT",
        prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
        gestureSettingsTouch: { pinchRotate: true },
        maxZoomPixelRatio: 2.5,
        visibilityRatio: 1.0,
        constrainDuringPan: true,
      }
      if (iiif) {
        opts.tileSources = iiif
      } else if (image) {
        opts.tileSources = { type: "image", url: image }
      }
      viewer = OpenSeadragon(opts)
      if (onReady) onReady(viewer)
    }
    load()
    return () => {
      mounted = false
      try { viewer?.destroy?.() } catch {}
    }
  }, [iiif, image, onReady])

  return <div ref={elRef} style={{ height }} className="w-full rounded border bg-black/5" />
}
