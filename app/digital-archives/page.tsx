"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Download, Share2, FileText, ImageIcon, Book, ScrollText, Search as SearchIcon, Filter } from "lucide-react"
import { toast } from "sonner"
import { archiveItems, type ArchiveItem } from "@/lib/archives"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// archiveItems + type now sourced from lib/archives

const typeIcon = (t: ArchiveItem["type"]) => {
  switch (t) {
    case "Manuscript":
      return <Book className="h-3.5 w-3.5" />
    case "Mural":
      return <ImageIcon className="h-3.5 w-3.5" />
    case "Photo":
      return <ImageIcon className="h-3.5 w-3.5" />
    case "Document":
      return <FileText className="h-3.5 w-3.5" />
  }
}

function statusClass(status: ArchiveItem["status"]) {
  if (status === "Excellent") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
  if (status === "Good") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
}

export default function DigitalArchivesPage() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<ArchiveItem | null>(null)
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<ArchiveItem["type"] | "All">("All")

  const { user, isAuthenticated } = useAuth()
  const isResearcher = user?.role === "researcher" || user?.role === "admin"

  const items = useMemo(() => archiveItems, [])

  // Treat some items as restricted for demo: murals and documents require researcher
  const isRestricted = useCallback((item: ArchiveItem) => {
    return item.type === "Mural" || item.type === "Document"
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((it) => {
      const matchesQ = !q
        || it.title.toLowerCase().includes(q)
        || it.monastery.toLowerCase().includes(q)
        || it.description.toLowerCase().includes(q)
        || it.century.toLowerCase().includes(q)
      const matchesType = typeFilter === "All" || it.type === typeFilter
      return matchesQ && matchesType
    })
  }, [items, query, typeFilter])

  const onPreview = useCallback((item: ArchiveItem) => {
    setActive(item)
    setOpen(true)
  }, [])

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

  async function downloadArchiveAsPDF(item: ArchiveItem) {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" })

    const margin = 40
    let y = margin
    const pageWidth = doc.internal.pageSize.getWidth()
    const contentWidth = pageWidth - margin * 2

    // Branded header with logo + site title
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
      doc.text("Sacred Heritage Explorer", margin + logoW + 10, y + 26)
      y += 44
      // separation line
      doc.setDrawColor(200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 26
    } catch {}

  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text(item.title, margin, y)
    y +=26

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.text(`${item.monastery} • ${item.century}`, margin, y)
    y += 26

    try {
      const dataUrl = await imageToDataUrl(item.image)
      // Compute image dimensions keeping aspect ratio, max height ~ 260pt
      const img = document.createElement("img")
      const imgLoaded: Promise<void> = new Promise((resolve) => {
        img.onload = () => resolve()
      })
      img.src = dataUrl
      await imgLoaded
      const maxImgHeight = 260
      const ratio = img.width / img.height
      let drawW = contentWidth
      let drawH = Math.round(drawW / ratio)
      if (drawH > maxImgHeight) {
        drawH = maxImgHeight
        drawW = Math.round(drawH * ratio)
      }
      const x = margin + (contentWidth - drawW) / 2
      doc.addImage(dataUrl, "JPEG", x, y, drawW, drawH)
      y += drawH + 16
    } catch {
      // If image fails, continue with text only
    }

    // Description
    doc.setFontSize(12)
    const desc = doc.splitTextToSize(item.description, contentWidth)
    doc.text(desc, margin, y)
    y += 18 + 14 * (Array.isArray(desc) ? desc.length - 1 : 0)

    // Meta table (two columns) — compute dynamic label widths to ensure proper gap
    const rows: Array<[string, string]> = [
      ["Language", item.language || "—"],
      ["Material", item.material || "—"],
      ["Dimensions", item.dimensions || "—"],
      ["Date Acquired", item.dateAcquired || "—"],
      ["Conservation Status", item.status],
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

      // Measure label width to position value with adequate spacing
      const labelWidth = doc.getTextWidth(labelText)
      const valueX = colX + labelWidth + valuePadding

      doc.setFont("helvetica", "normal")
      // If value might be long, ensure it doesn't overflow the column
      const availableValueWidth = colW - (labelWidth + valuePadding)
      const valueText = doc.splitTextToSize(rows[i][1], availableValueWidth)
      doc.text(valueText as any, valueX, rowY)
    }

    // Footer note
    const filename = `${item.title.replace(/\s+/g, "-").toLowerCase()}.pdf`
    doc.save(filename)
  }

  async function onShare(item: ArchiveItem) {
    const url = typeof window !== "undefined" ? window.location.origin + "/digital-archives#" + item.id : ""
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text: item.description, url })
      } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <header className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-primary">Research Archives</h1>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">
                Access digitized manuscripts, thangkas, murals, and scriptures preserved for research.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isResearcher ? (
                <Badge className="bg-emerald-600 text-white">Researcher Access</Badge>
              ) : (
                <Badge variant="secondary">Guest Mode</Badge>
              )}
            </div>
          </div>

          {/* Search + Type filter (enhanced) */}
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr,220px]">
            <div className="relative">
              <Label htmlFor="archive-search" className="sr-only">Search</Label>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="archive-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search archives, monasteries, or centuries"
                className="h-11 pl-10 rounded-xl bg-card/50 border-border hover:bg-card/70 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </div>
            <div className="relative">
              <Label htmlFor="type-filter" className="sr-only">Type</Label>
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger id="type-filter" className="h-11 pl-10 rounded-xl bg-card/50 border-border hover:bg-card/70 transition-colors focus:ring-2 focus:ring-primary/30">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Manuscript">Manuscript</SelectItem>
                  <SelectItem value="Mural">Mural</SelectItem>
                  <SelectItem value="Photo">Photo</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <section
          className="grid items-stretch gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:[grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] md:[grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]"
          id="collection"
        >
          {filtered.map((it) => (
            <Card key={it.id} className="relative overflow-hidden border border-border/60 p-0 rounded-2xl shadow-sm h-full flex flex-col">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
              <div className="relative h-48 sm:h-60 md:h-64">
                <Image src={it.image} alt={it.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />

                {/* Type badge */}
                <div className="absolute left-2 top-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 text-white px-2 py-0.5 text-[11px] font-medium ring-1 ring-white/10 backdrop-blur">
                    {typeIcon(it.type)}
                    <span className="uppercase tracking-wide">{it.type}</span>
                  </span>
                </div>
                {/* Century + Restriction badge */}
                <div className="absolute right-2 top-2">
                  <div className="flex gap-1">
                    {isRestricted(it) && (
                      <span className="inline-flex items-center rounded-full bg-red-600 text-white px-2 py-0.5 text-[11px] font-semibold ring-1 ring-red-700/70 shadow">
                        Restricted
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-amber-500 text-white px-2 py-0.5 text-[11px] font-semibold ring-1 ring-amber-600/70 shadow">
                      {it.century}
                    </span>
                  </div>
                </div>
              </div>

              <CardContent className="pb-3 pt-3 sm:pt-4 flex-1 flex flex-col">
                <h3 className="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight">{it.title}</h3>
                <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">{it.monastery}</p>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{it.description}</p>

                <div className="mt-3 space-y-1 text-[13px]">
                  <div className="flex items-center gap-2"><span className="font-semibold">Language:</span><span>{it.language}</span></div>
                  <div className="flex items-center gap-2"><span className="font-semibold">Material:</span><span>{it.material}</span></div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Status:</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(it.status)}`}>{it.status}</span>
                  </div>
                </div>

                <div className="mt-auto pt-3 flex items-center gap-2">
                  <Button className="grow h-10 text-sm sm:text-base" onClick={() => onPreview(it)}>Preview</Button>
                  {isRestricted(it) && !isResearcher ? (
                    <Button
                      variant="destructive"
                      className="h-10 text-sm sm:text-base"
                      onClick={() => toast.info("Request sent. You'll be notified on approval.")}
                    >
                      Request Access
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-10 text-sm sm:text-base"
                      onClick={() => downloadArchiveAsPDF(it)}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Benefits strip */}
        <section className="rounded-2xl border border-border p-4 sm:p-6 bg-card">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xl font-semibold">Prevention</h3>
              <p className="text-sm text-muted-foreground">Prevents loss due to decay, fire, theft, or natural disasters.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Global Access</h3>
              <p className="text-sm text-muted-foreground">Scholars and monks worldwide can access them for research.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Cultural Library</h3>
              <p className="text-sm text-muted-foreground">Creates a permanent cultural library for future generations.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Preview Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[96vw] sm:max-w-5xl md:max-w-6xl p-4 sm:p-6">
          {active && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-3xl font-bold">{active.title}</DialogTitle>
                <DialogDescription className="text-sm sm:text-lg text-muted-foreground">
                  {active.monastery} • {active.century}
                </DialogDescription>
              </DialogHeader>

              <div className="relative mt-3 sm:mt-4 h-72 sm:h-96 md:h-[30rem] rounded overflow-hidden">
                <Image src={active.image} alt={active.title} fill className="object-cover" />
              </div>

              <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted-foreground">{active.description}</p>

              <div className="mt-5 sm:mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 text-sm sm:text-base">
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-medium">Language:</span>
                  <span>{active.language}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-medium">Material:</span>
                  <span>{active.material}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-medium">Dimensions:</span>
                  <span>{active.dimensions || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-medium">Date Acquired:</span>
                  <span>{active.dateAcquired || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3 sm:col-span-2">
                  <span className="font-medium">Conservation Status:</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs sm:text-sm ${statusClass(active.status)}`}>{active.status}</span>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3">
                {(!isRestricted(active) || isResearcher) && (
                  <Button className="grow h-14 text-base sm:text-lg" onClick={() => downloadArchiveAsPDF(active)}>
                    <Download className="mr-2 h-5 w-5" /> Download High Resolution
                  </Button>
                )}
                {isRestricted(active) && !isResearcher && (
                  <Button
                    variant="destructive"
                    onClick={() => toast.info("Request sent. You'll be notified on approval.")}
                    className="grow h-14 text-base sm:text-lg"
                  >
                    Request Access
                  </Button>
                )}
                <Button variant="outline" onClick={() => onShare(active)} className="grow h-14 text-base sm:text-lg">
                  <Share2 className="mr-2 h-5 w-5" /> Share Archive
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
