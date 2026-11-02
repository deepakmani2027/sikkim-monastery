"use client"

import { useCallback, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const HighResViewer = dynamic(() => import("./HighResViewer"), { ssr: false })

type Source = { id?: string; iiif?: string; image?: string; title?: string }
type Option = { id: string; title: string; iiif?: string; image?: string }

export default function ComparativeViewer({ left, right, height = 520, pickList = [], onPickRight }: { left: Source; right?: Source; height?: number; pickList?: Option[]; onPickRight?: (id: string)=>void }) {
  const leftRef = useRef<any>(null)
  const rightRef = useRef<any>(null)
  const [locked, setLocked] = useState(true)

  const sync = useCallback((from: any, to: any) => {
    if (!locked || !from || !to) return
    try {
      const center = from.viewport.getCenter(true)
      const zoom = from.viewport.getZoom(true)
      to.viewport.panTo(center, true)
      to.viewport.zoomTo(zoom, center, true)
    } catch {}
  }, [locked])

  const onLeftReady = useCallback((v: any) => {
    leftRef.current = v
    v.addHandler?.("animation", () => sync(leftRef.current, rightRef.current))
  }, [sync])

  const onRightReady = useCallback((v: any) => {
    rightRef.current = v
    v.addHandler?.("animation", () => sync(rightRef.current, leftRef.current))
  }, [sync])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={locked} onChange={e=>setLocked(e.target.checked)} />
          Lock pan/zoom
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          {left.title && (
            <div className="flex items-center justify-between mb-1 h-8">
              <div className="text-sm font-medium truncate" title={left.title}>{left.title}</div>
            </div>
          )}
          <HighResViewer iiif={left.iiif} image={left.image} height={height} onReady={onLeftReady} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1 h-8">
            <div className="text-sm font-medium truncate mr-2">{right?.title || "Choose item to compare"}</div>
            {pickList.length > 0 && (
              <Select onValueChange={(id)=> onPickRight?.(id)} value={right?.id}
              >
                <SelectTrigger className="h-8 w-48">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {pickList.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {right?.iiif || right?.image ? (
            <HighResViewer iiif={right?.iiif} image={right?.image} height={height} onReady={onRightReady} />
          ) : (
            <div className="w-full rounded border bg-muted/40" style={{ height }} />
          )}
        </div>
      </div>
    </div>
  )
}
