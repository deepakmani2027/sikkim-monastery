"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/layout/navbar"
import { Calendar, MapPin, Type as TypeIcon, Shield } from "lucide-react"
import { digitalArchiveItems } from "@/lib/digitalArchive"

const ComparativeViewer = dynamic(() => import("@/components/research/ComparativeViewer"), { ssr: false })

export default function ComparePage() {
  const sp = useSearchParams()
  const router = useRouter()
  const ids = useMemo(() => sp.get("ids")?.split(",").map(s=>s.trim()).filter(Boolean) || [], [sp])
  const [rightId, setRightId] = useState<string | undefined>(ids[1])
  const [mounted, setMounted] = useState(false)
  useEffect(()=>{ setMounted(true) }, [])

  const left = useMemo(() => digitalArchiveItems.find(i => i.id === ids[0]), [ids])
  const right = useMemo(() => digitalArchiveItems.find(i => i.id === rightId), [rightId])
  const pickList = useMemo(() => digitalArchiveItems.filter(i => i.id !== left?.id).map(i => ({ id: i.id, title: i.title, iiif: i.iiif, image: i.image })), [left])

  useEffect(()=>{ if(!rightId && ids[1]) setRightId(ids[1]) }, [ids, rightId])

  if (!mounted) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <h1 className="text-xl font-semibold mb-3">Comparative View</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
            <div className="relative overflow-hidden rounded-xl border border-border/40 bg-amber-50/50 dark:bg-amber-900/10 p-3 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
              <div className="absolute inset-y-0 left-0 w-1 bg-border" />
              <div className="font-medium truncate pr-2">Loading…</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">—</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">—</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-border/40 bg-amber-50/50 dark:bg-amber-900/10 p-3 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
              <div className="absolute inset-y-0 left-0 w-1 bg-border" />
              <div className="font-medium truncate pr-2">Choose item to compare</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">—</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">—</span>
              </div>
            </div>
          </div>
          <div className="rounded-md border bg-muted/20 h-[560px]" />
        </div>
      </>
    )
  }

  if (!left) return <div className="container mx-auto p-4">Provide ids in query, e.g. /manuscripts/compare?ids=rumtek-ms-001,thangka-002</div>

  const kindBar = (k?: string) => {
    switch ((k || "").toLowerCase()) {
      case "manuscript":
        return "bg-primary"
      case "thangka":
        return "bg-secondary"
      case "mural":
        return "bg-accent"
      default:
        return "bg-border"
    }
  }

  const chip = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground"

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-xl font-semibold mb-3">Comparative View</h1>
        {/* Metadata Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
          {/* Left item meta */}
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-amber-50/50 dark:bg-amber-900/10 p-3 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <div className={`absolute inset-y-0 left-0 w-1 ${kindBar(left.kind)}`} />
            <div className="font-medium truncate pr-2" title={left.title} suppressHydrationWarning>{left.title}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {left.date && (
                <span className={chip}><Calendar className="h-3 w-3" /> {left.date}</span>
              )}
              {left.origin && (
                <span className={chip}><MapPin className="h-3 w-3" /> {left.origin}</span>
              )}
              {left.script && (
                <span className={chip}><TypeIcon className="h-3 w-3" /> {left.script}</span>
              )}
              {left.preservation && (
                <span className={chip}><Shield className="h-3 w-3" /> {left.preservation}</span>
              )}
            </div>
          </div>
          {/* Right item meta */}
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-amber-50/50 dark:bg-amber-900/10 p-3 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <div className={`absolute inset-y-0 left-0 w-1 ${kindBar(right?.kind)}`} />
            <div className="font-medium truncate pr-2" title={right?.title || "Choose item to compare"} suppressHydrationWarning>{right?.title || "Choose item to compare"}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {right?.date && (
                <span className={chip}><Calendar className="h-3 w-3" /> {right.date}</span>
              )}
              {right?.origin && (
                <span className={chip}><MapPin className="h-3 w-3" /> {right.origin}</span>
              )}
              {right?.script && (
                <span className={chip}><TypeIcon className="h-3 w-3" /> {right.script}</span>
              )}
              {right?.preservation && (
                <span className={chip}><Shield className="h-3 w-3" /> {right.preservation}</span>
              )}
            </div>
          </div>
        </div>
        <ComparativeViewer
        left={{ id: left.id, title: left.title, iiif: left.iiif, image: left.image }}
        right={right ? { id: right.id, title: right.title, iiif: right.iiif, image: right.image } : undefined}
        pickList={pickList}
        onPickRight={(id)=>{
          setRightId(id)
          const base = `/manuscripts/compare?ids=${encodeURIComponent(left.id)}`
          router.replace(id ? `${base},${encodeURIComponent(id)}` : base)
        }}
        height={560}
        />
      </div>
    </>
  )
}
