"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { digitalArchiveItems } from "@/lib/digitalArchive"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { ImageIcon, ScrollText, Palette, Filter, Search as SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"

const HighResViewer = dynamic(() => import("@/components/research/HighResViewer"), { ssr: false })

function getKindBar(kind: string){
  switch(kind){
    case "manuscript": return "bg-amber-600"
    case "thangka": return "bg-rose-600"
    case "mural": return "bg-indigo-600"
    case "inscription": return "bg-emerald-600"
    default: return "bg-gray-400"
  }
}

function getThumbRing(kind: string){
  switch(kind){
    case "manuscript": return "ring-amber-600/50"
    case "thangka": return "ring-rose-600/50"
    case "mural": return "ring-indigo-600/50"
    case "inscription": return "ring-emerald-600/50"
    default: return "ring-border"
  }
}

export default function DigitalArchiveAllPage(){
  const [viewerOpen, setViewerOpen] = useState(false)
  const [active, setActive] = useState<(typeof digitalArchiveItems)[number] | null>(null)
  const [typeFilter, setTypeFilter] = useState<"All"|"manuscript"|"thangka"|"mural"|"inscription">("All")
  const [query, setQuery] = useState("")
  const { user } = useAuth()
  const isResearcher = user?.role === "researcher" || user?.role === "admin"

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase()
    return digitalArchiveItems.filter(it => {
      const matchesQ = !q
        || it.title.toLowerCase().includes(q)
        || (it.origin || "").toLowerCase().includes(q)
        || (it.script || "").toLowerCase().includes(q)
        || (it.date || "").toLowerCase().includes(q)
        || (it.description || "").toLowerCase().includes(q)
      const matchesType = typeFilter === "All" || it.kind === typeFilter
      return matchesQ && matchesType
    })
  }, [query, typeFilter])

  async function imageToDataUrl(src: string): Promise<string> {
    const url = src.startsWith("http") ? src : `${window.location.origin}${src}`
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  }

  async function downloadArchiveAsPDF(item: (typeof digitalArchiveItems)[number]) {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" })
    const margin = 40
    let y = margin
    const pageWidth = doc.internal.pageSize.getWidth()
    const contentWidth = pageWidth - margin * 2

    // Header with logo + branding
    try {
      const logoData = await imageToDataUrl("/main.jpeg")
      const logoW = 36
      const logoH = 36
      doc.addImage(logoData, "JPEG", margin, y - 6, logoW, logoH)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("DharmaTech", margin + logoW + 10, y + 10)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text("Digital Manuscript & Thangka Archive", margin + logoW + 10, y + 26)
      y += 44
      doc.setDrawColor(200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 26
    } catch {}

    // Title + subtitle
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.text(item.title, margin, y)
    y += 26
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    const subtitle = [item.origin || "", item.date || ""].filter(Boolean).join(" • ") || ""
    if (subtitle) { doc.text(subtitle, margin, y); y += 26 }

    // Image
    if (item.image) {
      try {
        const dataUrl = await imageToDataUrl(item.image)
        const img = document.createElement("img")
        const loaded: Promise<void> = new Promise((r)=>{ img.onload = ()=> r() })
        img.src = dataUrl
        await loaded
        const maxImgHeight = 260
        const ratio = img.width / img.height
        let drawW = contentWidth
        let drawH = Math.round(drawW / ratio)
        if (drawH > maxImgHeight) { drawH = maxImgHeight; drawW = Math.round(drawH * ratio) }
        const x = margin + (contentWidth - drawW) / 2
        doc.addImage(dataUrl, "JPEG", x, y, drawW, drawH)
        y += drawH + 16
      } catch {}
    }

    // Description
    if (item.description) {
      doc.setFontSize(12)
      const desc = doc.splitTextToSize(item.description, contentWidth)
      doc.text(desc as any, margin, y)
      y += 18 + 14 * (Array.isArray(desc) ? (desc as string[]).length - 1 : 0)
    }

    // Meta two-column
    const rows: Array<[string, string]> = [
      ["Origin", item.origin || "—"],
      ["Date", item.date || "—"],
      ["Script", item.script || "—"],
      ["Preservation", item.preservation || "—"],
      ["Author", item.author || "—"],
      ["IIIF", item.iiif ? "Available" : "—"],
    ]
    const colW = contentWidth / 2
    const rowH = 22
    const valuePadding = 8
    doc.setFontSize(12)
    for (let i = 0; i < rows.length; i++) {
      const col = i % 2
      const row = Math.floor(i / 2)
      const rowY = y + row * rowH
      const colX = margin + col * colW
      const labelText = `${rows[i][0]}:`
      doc.setFont("helvetica", "bold")
      doc.text(labelText, colX, rowY)
      const labelWidth = doc.getTextWidth(labelText)
      const valueX = colX + labelWidth + valuePadding
      doc.setFont("helvetica", "normal")
      const availableW = colW - (labelWidth + valuePadding)
      const valueText = doc.splitTextToSize(rows[i][1], availableW)
      doc.text(valueText as any, valueX, rowY)
    }

    const filename = `${item.title.replace(/\s+/g, "-").toLowerCase()}.pdf`
    doc.save(filename)
  }
  return (
    <>
    <Navbar />
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-primary">Digital Manuscript & Thangka Archive</h1>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">Complete list of digitized items for research.</p>
          </div>
          <div className="flex items-center gap-2">
            {isResearcher ? (
              <Badge className="bg-emerald-600 text-white">Researcher Access</Badge>
            ) : (
              <Badge variant="secondary">Guest Mode</Badge>
            )}
          </div>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr,220px]">
          <div className="relative">
            <Label htmlFor="digital-search" className="sr-only">Search</Label>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="digital-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, monasteries, scripts, or centuries"
              className="h-11 pl-10 rounded-xl bg-card/50 border-border hover:bg-card/70 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div className="relative">
            <Label htmlFor="type-filter" className="sr-only">Type</Label>
            <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={(v)=> setTypeFilter(v as any)}>
              <SelectTrigger id="type-filter" className="h-11 pl-10 rounded-xl bg-card/50 border-border hover:bg-card/70 transition-colors focus:ring-2 focus:ring-primary/30">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="manuscript">Manuscript</SelectItem>
                <SelectItem value="thangka">Thangka</SelectItem>
                <SelectItem value="mural">Mural</SelectItem>
                <SelectItem value="inscription">Inscription</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <section className="grid items-stretch gap-4 md:gap-6 grid-cols-1 sm:[grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] md:[grid-template-columns:repeat(auto-fit,minmax(380px,1fr))]">
        {filtered.map((it) => (
          <Card
            key={it.id}
              className="relative overflow-hidden rounded-2xl border border-border/60 p-0 shadow-sm h-full flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all bg-[#F1E681] dark:bg-amber-950/30"
          >
            {/* Image header */}
            <div className="relative h-56 sm:h-72 md:h-80">
              <Image
                src={it.image || "/placeholder.jpg"}
                alt={it.title}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 33vw"
              />
              {/* gradient for better legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              {/* Kind badge */}
              <div className="absolute left-3 top-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/65 text-white px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ring-1 ring-white/10 backdrop-blur">
                  {it.kind}
                </span>
              </div>
              {/* Date badge */}
              {it.date && (
                <div className="absolute right-3 top-3">
                  <span className="inline-flex items-center rounded-full bg-amber-500 text-white px-2.5 py-1 text-[11px] font-semibold ring-1 ring-amber-600/70 shadow">
                    {it.date}
                  </span>
                </div>
              )}
            </div>

            {/* Content panel */}
            <CardContent className="pt-0 sm:pt-1 pb-5 flex-1 flex flex-col bg-transparent">
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-rose-900 dark:text-rose-300">
                {it.title}
              </h3>
              {it.origin && (
                <p className="mt-1 text-sm sm:text-base text-muted-foreground">{it.origin}</p>
              )}
              {it.description && (
                <p className="mt-3 text-sm sm:text-base text-muted-foreground/90 line-clamp-3">
                  {it.description}
                </p>
              )}

              <div className="mt-4 space-y-2.5 rounded-xl border border-amber-900/10 bg-amber-100/70 dark:bg-transparent p-3 sm:p-4 text-sm sm:text-base">
                {/* Script / Style */}
                {it.script && (
                  <div className="flex items-start gap-2">
                    <span className="min-w-[9rem] font-semibold text-rose-800 dark:text-rose-300">Script / Style</span>
                    <span className="text-foreground/90">{it.script}</span>
                  </div>
                )}
                {/* Material & Technique */}
                {it.materialTechnique && (
                  <div className="flex items-start gap-2">
                    <span className="min-w-[9rem] font-semibold text-rose-800 dark:text-rose-300">Material & Technique</span>
                    <span className="text-foreground/90">{it.materialTechnique}</span>
                  </div>
                )}
                {/* Iconography */}
                {it.iconography && (
                  <div className="flex items-start gap-2">
                    <span className="min-w-[9rem] font-semibold text-rose-800 dark:text-rose-300">Iconography</span>
                    <span className="text-foreground/90">{it.iconography}</span>
                  </div>
                )}
                {/* Preservation */}
                {it.preservation && (
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="min-w-[9rem] font-semibold text-rose-800 dark:text-rose-300">Preservation</span>
                    <span className="inline-flex items-center rounded-full border bg-white/70 dark:bg-white/10 px-2.5 py-0.5 text-xs sm:text-sm font-medium">
                      {it.preservation}
                    </span>
                  </div>
                )}
                {/* Significance */}
                {it.significance && (
                  <div className="flex items-start gap-2">
                    <span className="min-w-[9rem] font-semibold text-rose-800 dark:text-rose-300">Significance</span>
                    <span className="text-foreground/90">{it.significance}</span>
                  </div>
                )}
                {/* Tags */}
                {it.tags && it.tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="min-w-[9rem] font-semibold text-rose-800 dark:text-rose-300">Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {it.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full border bg-white/70 dark:bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 flex items-center gap-2">
                <Button className="grow h-11 text-base" onClick={() => { setActive(it); setViewerOpen(true) }}>
                  Preview
                </Button>
                <Button asChild variant="outline" className="h-11 text-base">
                  <Link href={`/manuscripts/compare?ids=${encodeURIComponent(it.id)}`}>Compare</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      {/* High-Res Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-5xl xl:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{active?.title || "High-Resolution Viewer"}</DialogTitle>
            <DialogDescription>Deep zoom viewer with IIIF support</DialogDescription>
          </DialogHeader>
          <HighResViewer iiif={active?.iiif} image={active?.image} height={600} />
        </DialogContent>
      </Dialog>
    </main>
    </>
  )
}
