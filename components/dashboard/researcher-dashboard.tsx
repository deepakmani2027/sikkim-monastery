"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, FileText, Download, BookOpen, Filter, Clock, Archive } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { ScholarSearch } from "@/components/research/ScholarSearch"
import { archiveItems } from "@/lib/archives"
import { digitalArchiveItems, DigitalArchiveItem } from "@/lib/digitalArchive"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

export function ResearcherDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [active, setActive] = useState<(typeof recentArchives)[number] | null>(null)
  const [citeOpen, setCiteOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [collectionsOpen, setCollectionsOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [compareSel, setCompareSel] = useState<DigitalArchiveItem[]>([])

  // Citation form state
  const [authors, setAuthors] = useState("")
  const [year, setYear] = useState("")
  const [title, setTitle] = useState("")
  const [link, setLink] = useState("")
  const [style, setStyle] = useState<"apa"|"mla"|"chicago">("apa")
  const formattedCitation = (() => {
    const A = authors || "Unknown"
    const Y = year ? ` (${year})` : ""
    const T = title || "Untitled"
    const L = link ? ` ${link}` : ""
    switch(style){
      case "mla": return `${A}. "${T}."${Y}${L}`
      case "chicago": return `${A}.${Y} ${T}.${L}`
      default: return `${A}${Y}. ${T}.${L}`
    }
  })()

  function fillFromActive(){
    if(!active) return
    setTitle(active.title)
    setYear(active.period?.match(/\d{4}|\d+th/)?.[0] || "")
    setAuthors(ActiveToAuthor(active))
    setLink("")
  }

  function ActiveToAuthor(a: (typeof recentArchives)[number]){ return a.monastery ? `${a.monastery} Monastery` : "" }

  function copyCitation(){
    navigator.clipboard?.writeText(formattedCitation).then(()=> toast.success("Citation copied"))
  }

  // Collections (localStorage)
  const COLLECTION_KEY = "research_collections"
  function getCollections(): number[]{
    try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)||"[]") } catch { return [] }
  }
  const [collections, setCollections] = useState<number[]>([])
  useEffect(()=>{ if(typeof window!=="undefined") setCollections(getCollections()) }, [])
  function toggleCollection(id:number){
    const cur = new Set(getCollections())
    if(cur.has(id)) cur.delete(id); else cur.add(id)
    const arr = Array.from(cur)
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(arr))
    setCollections(arr)
    toast.success(cur.has(id)?"Added to Collections":"Removed from Collections")
  }

  // Bulk download selection (defined after recentArchives below)

  const recentArchives = [
    {
      id: 1,
      title: "Ancient Manuscripts of Rumtek Monastery",
      type: "Manuscript",
      period: "15th Century",
      monastery: "Rumtek",
      size: "2.3 MB",
      downloads: 45,
      restricted: false,
      image: "/rumtek-monastery-sikkim-buddhist-temple.jpg",
    },
    {
      id: 2,
      title: "Architectural Drawings - Pemayangtse",
      type: "Blueprint",
      period: "18th Century",
      monastery: "Pemayangtse",
      size: "5.7 MB",
      downloads: 23,
      restricted: true,
      image: "/pemayangtse-monastery-sikkim-mountain-view.jpg",
    },
    {
      id: 3,
      title: "Ritual Artifacts Documentation",
      type: "Catalog",
      period: "19th Century",
      monastery: "Tashiding",
      size: "1.8 MB",
      downloads: 67,
      restricted: false,
      image: "/tashiding-monastery-bumchu-ceremony.jpg",
    },
  ]

  // Dynamic KPIs
  const totalArchives = archiveItems.length
  const totalManuscripts = archiveItems.filter((a) => a.type === "Manuscript").length
  const [downloadsCount, setDownloadsCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const d = JSON.parse(localStorage.getItem('research_downloads') || '[]')
      const r = JSON.parse(localStorage.getItem('research_requests') || '[]')
      setDownloadsCount(Array.isArray(d) ? d.length : 0)
      setPendingCount(Array.isArray(r) ? r.length : 0)
    } catch {}
  }, [])

  // Bulk download selection (after recentArchives)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const allIds = recentArchives.map(a=>a.id)
  const allSelected = selectedIds.length === allIds.length
  function toggleSelectAll(){ setSelectedIds(allSelected?[]:allIds) }
  function toggleSelect(id:number){ setSelectedIds(prev=> prev.includes(id)? prev.filter(x=>x!==id): [...prev,id]) }
  async function runBulkDownload(){
    if(selectedIds.length===0){ toast("Select at least one item"); return }
    for(const id of selectedIds){
      const item = recentArchives.find(a=>a.id===id)
      if(item && !item.restricted){
        await downloadArchive(item)
      }
    }
    toast.success("Bulk download started for selected items")
    setBulkOpen(false)
  }

  const researchStats = [
    { label: "Total Archives", value: totalArchives.toLocaleString(), bubble: "bg-primary/10", valueClass: "text-primary" },
    { label: "Manuscripts", value: totalManuscripts.toLocaleString(), bubble: "bg-secondary/10", valueClass: "text-secondary" },
    { label: "Your Downloads", value: downloadsCount.toLocaleString(), bubble: "bg-accent/10", valueClass: "text-accent" },
    { label: "Pending Requests", value: pendingCount.toLocaleString(), bubble: "bg-primary/10", valueClass: "text-primary" },
  ]

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "manuscript":
        return "bg-primary/10 text-primary"
      case "blueprint":
        return "bg-secondary/10 text-secondary"
      case "catalog":
        return "bg-accent/10 text-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeBar = (type: string) => {
    switch (type.toLowerCase()) {
      case "manuscript":
        return "bg-primary"
      case "blueprint":
        return "bg-secondary"
      case "catalog":
        return "bg-accent"
      default:
        return "bg-border"
    }
  }

  const getKindBar = (kind?: string) => {
    switch ((kind || "").toLowerCase()) {
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

  function onPreview(archive: (typeof recentArchives)[number]) {
    setActive(archive)
    setPreviewOpen(true)
  }

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

  async function downloadArchive(archive: (typeof recentArchives)[number]) {
    // Lightweight branded PDF export (title + metadata)
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" })
      const margin = 40
      let y = margin
      doc.setFont("helvetica", "bold")
      doc.setFontSize(18)
      doc.text(archive.title, margin, y)
      y += 24
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      const meta = [
        ["Type", archive.type],
        ["Period", archive.period],
        ["Monastery", `${archive.monastery} Monastery`],
        ["File Size", archive.size],
        ["Downloads", String(archive.downloads)],
      ]
      meta.forEach(([k, v]) => {
        doc.text(`${k}: ${v}`, margin, y)
        y += 18
      })

      // Add image preview if available
      if (archive.image) {
        try {
          const dataUrl = await imageToDataUrl(archive.image)
          const pageWidth = doc.internal.pageSize.getWidth()
          const contentWidth = pageWidth - margin * 2
          // Determine dimensions while keeping aspect ratio
          const tmp = document.createElement("img")
          const loaded: Promise<void> = new Promise((r) => (tmp.onload = () => r()))
          tmp.src = dataUrl
          await loaded
          const maxH = 260
          const ratio = tmp.width / tmp.height
          let w = contentWidth
          let h = Math.round(w / ratio)
          if (h > maxH) {
            h = maxH
            w = Math.round(h * ratio)
          }
          const x = margin + (contentWidth - w) / 2
          y += 8
          doc.addImage(dataUrl, "JPEG", x, y, w, h)
          y += h + 10
        } catch {
          // ignore image failure
        }
      }
      const filename = `${archive.title.replace(/\s+/g, "-").toLowerCase()}.pdf`
      doc.save(filename)
      toast.success("Download started")
      // Record download locally for KPI
      try {
        const key = 'research_downloads'
        const raw = localStorage.getItem(key)
        const list: Array<number> = raw ? JSON.parse(raw) : []
        if (!list.includes(archive.id)) list.unshift(archive.id)
        localStorage.setItem(key, JSON.stringify(list))
        setDownloadsCount(list.length)
      } catch {}
    } catch (e: any) {
      toast.error(e?.message || "Failed to download")
    }
  }

  function requestAccess(archive: (typeof recentArchives)[number]) {
    toast.info("Request sent. You'll be notified on approval.")
    try {
      const key = 'research_requests'
      const raw = localStorage.getItem(key)
      const list: Array<number> = raw ? JSON.parse(raw) : []
      if (!list.includes(archive.id)) list.unshift(archive.id)
      localStorage.setItem(key, JSON.stringify(list))
      setPendingCount(list.length)
    } catch {}
  }

  const HighResViewer = dynamic(() => import("@/components/research/HighResViewer"), { ssr: false })
  const ComparativeViewer = dynamic(() => import("@/components/research/ComparativeViewer"), { ssr: false })

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg p-6 monastery-pattern">
        <h2 className="text-2xl font-bold text-foreground mb-2">Research Archives</h2>
        <p className="text-muted-foreground mb-4">
          Access comprehensive digital archives of manuscripts, artifacts, and historical documents.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search archives, manuscripts, artifacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filter
          </Button>
        </div>
      </div>

      {/* Research Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {researchStats.map((stat, index) => (
          <Card key={index} className="group relative overflow-hidden transition-all duration-300 border-border/60 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 bg-amber-100/70 dark:bg-amber-900/10">
            <div className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full ${stat.bubble} blur-2xl`} />
            <CardContent className="p-6 text-center">
              <div className={`text-3xl font-extrabold ${stat.valueClass} transition-transform duration-300 group-hover:scale-110`}>{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI-Powered Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            AI-Powered Research Paper Search
          </CardTitle>
          <CardDescription>Use natural language to search through manuscripts and artifacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ScholarSearch />
          </div>
        </CardContent>
      </Card>

      {/* Recent Archives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Archives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentArchives.map((archive) => (
              <div key={archive.id} className="relative overflow-hidden rounded-xl border border-border/20 bg-gradient-to-r from-background/80 to-transparent shadow-[0_1px_0_rgba(0,0,0,0.03)] hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`absolute inset-y-0 left-0 w-1 ${getTypeBar(archive.type)}`} />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground break-words">{archive.title}</h4>
                    {archive.restricted && (
                      <Badge variant="destructive" className="text-xs">
                        Restricted
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="flex items-center gap-1"><Badge className={getTypeColor(archive.type)}>{archive.type}</Badge></span>
                    <span className="px-2 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">{archive.period}</span>
                    <span className="px-2 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">{archive.monastery} Monastery</span>
                    <span className="px-2 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">{archive.size}</span>
                    <span className="px-2 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">{archive.downloads} downloads</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                  <Button size="sm" variant="outline" onClick={() => onPreview(archive)} className="w-full sm:w-auto justify-center">
                    Preview
                  </Button>
                  {!archive.restricted ? (
                    <Button size="sm" onClick={() => downloadArchive(archive)} className="w-full sm:w-auto justify-center">
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => requestAccess(archive)} className="w-full sm:w-auto justify-center">
                      Request Access
                    </Button>
                  )}
                </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Digital Manuscript & Thangka Archive */}
      <Card>
        <CardHeader>
          <CardTitle>Digital Manuscript & Thangka Archive</CardTitle>
          <CardDescription>High-resolution IIIF-ready items for scholarly analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {digitalArchiveItems.slice(0,3).map((it) => (
              <div key={it.id} className="relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-r from-background/80 to-transparent shadow-[0_1px_0_rgba(0,0,0,0.03)] hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`absolute inset-y-0 left-0 w-1 ${getKindBar(it.kind)}`} />
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-semibold break-words">{it.title}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {it.kind && <span className="px-2 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground capitalize">{it.kind}</span>}
                      {it.date && <span className="px-2 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">{it.date}</span>}
                      {it.origin && <span className="px-2 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">{it.origin}</span>}
                      {it.script && <span className="px-2 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">{it.script}</span>}
                      {it.preservation && <span className="px-2 py-1 rounded-full border bg-muted/30 text-xs text-muted-foreground">Preservation: {it.preservation}</span>}
                    </div>
                  </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={()=>{ setActive(null as any); setViewerOpen(true); setCompareSel([it]) }}>View</Button>
                  <Button className="w-full sm:w-auto" onClick={()=>{
                    router.push(`/manuscripts/compare?ids=${encodeURIComponent(it.id)}`)
                  }}>Compare</Button>
                </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="secondary">
              <a href="/digital-archives/digital">See all</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* High-Res Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-5xl xl:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{compareSel[0]?.title || "High-Resolution Viewer"}</DialogTitle>
            <DialogDescription>Deep zoom viewer with IIIF support</DialogDescription>
          </DialogHeader>
          <HighResViewer iiif={compareSel[0]?.iiif} image={compareSel[0]?.image} height={600} />
        </DialogContent>
      </Dialog>

      {/* Comparative Viewer Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl xl:max-w-7xl">
          <DialogHeader>
            <DialogTitle>Comparative View</DialogTitle>
            <DialogDescription>Side-by-side analysis of two items</DialogDescription>
          </DialogHeader>
          <ComparativeViewer
            left={{ id: compareSel[0]?.id, title: compareSel[0]?.title, iiif: compareSel[0]?.iiif, image: compareSel[0]?.image }}
            right={compareSel[1] ? { id: compareSel[1]?.id, title: compareSel[1]?.title, iiif: compareSel[1]?.iiif, image: compareSel[1]?.image } : undefined}
            pickList={digitalArchiveItems.filter(it=> it.id !== compareSel[0]?.id).map(it=> ({ id: it.id, title: it.title, iiif: it.iiif, image: it.image }))}
            onPickRight={(id)=>{
              const found = digitalArchiveItems.find(it=> it.id === id)
              if(found){ setCompareSel([compareSel[0]!, found]) }
            }}
            height={560}
          />
          <div className="text-xs text-muted-foreground mt-2">Tip: Use two-finger pinch/drag to explore details.</div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          {active && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold">{active.title}</DialogTitle>
                <DialogDescription>
                  {active.period} • {active.monastery} Monastery
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getTypeColor(active.type)}>{active.type}</Badge>
                {active.restricted && (
                  <Badge variant="destructive">Restricted</Badge>
                )}
              </div>

              {/* Image preview */}
              {active.image && (
                <div className="relative h-56 sm:h-72 md:h-80 rounded overflow-hidden">
                  <Image src={active.image} alt={active.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 60vw" />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium">{active.period}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Monastery</span>
                  <span className="font-medium">{active.monastery} Monastery</span>
                </div>
                <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">File Size</span>
                  <span className="font-medium">{active.size}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Downloads</span>
                  <span className="font-medium">{active.downloads}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {!active.restricted ? (
                  <Button onClick={() => downloadArchive(active)} className="flex-1">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => requestAccess(active)}
                    className="flex-1"
                  >
                    Request Access
                  </Button>
                )}
                <Button variant="outline" onClick={() => setPreviewOpen(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Citation Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Research Tools</CardTitle>
          <CardDescription>Tools to help with your research and citations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={()=>{ setCiteOpen(true); fillFromActive(); }}>
              <FileText className="h-6 w-6 mb-2" />
              Citation Generator
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={()=> setBulkOpen(true)}>
              <Download className="h-6 w-6 mb-2" />
              Bulk Download
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={()=> setCollectionsOpen(true)}>
              <Archive className="h-6 w-6 mb-2" />
              My Collections
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Citation Generator Dialog */}
      <Dialog open={citeOpen} onOpenChange={setCiteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Citation</DialogTitle>
            <DialogDescription>Fill details or auto-fill from the selected archive preview.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Authors (e.g., Samuel, Geoffrey)" value={authors} onChange={e=>setAuthors(e.target.value)} />
            <div className="flex gap-2">
              <Input placeholder="Year" value={year} onChange={e=>setYear(e.target.value)} className="w-28" />
              <Input placeholder="Style (apa, mla, chicago)" value={style} onChange={e=> setStyle((e.target.value.toLowerCase() as any) || 'apa')} className="w-40" />
            </div>
            <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <Input placeholder="Link (optional)" value={link} onChange={e=>setLink(e.target.value)} />
            <div className="rounded-md border p-3 bg-muted/30 text-sm">
              <div className="text-muted-foreground mb-1">Preview</div>
              <div className="font-medium break-words">{formattedCitation}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyCitation} className="flex-1">Copy</Button>
              <Button variant="outline" onClick={()=> setCiteOpen(false)} className="flex-1">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Download Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Bulk Download</DialogTitle>
            <DialogDescription>Select items to download as PDFs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll as any} />
              <span className="text-sm">Select all</span>
            </div>
            <div className="max-h-64 overflow-auto space-y-2 pr-1">
              {recentArchives.map(a=> (
                <label key={a.id} className="flex items-center gap-2 rounded border p-2 bg-muted/20">
                  <Checkbox checked={selectedIds.includes(a.id)} onCheckedChange={()=>toggleSelect(a.id)} />
                  <span className="text-sm flex-1">{a.title}</span>
                  {a.restricted && <Badge variant="destructive">Restricted</Badge>}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={runBulkDownload} className="flex-1" disabled={selectedIds.length===0}>Download Selected</Button>
              <Button variant="outline" onClick={()=> setBulkOpen(false)} className="flex-1">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* My Collections Dialog */}
      <Dialog open={collectionsOpen} onOpenChange={setCollectionsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>My Collections</DialogTitle>
            <DialogDescription>Save and manage items locally.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Tap the bookmark button below to add/remove.</div>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {recentArchives.map(a=>{
                const saved = collections.includes(a.id)
                return (
                  <div key={a.id} className="flex items-center justify-between rounded border p-2 bg-muted/20">
                    <div className="text-sm mr-2 flex-1">{a.title}</div>
                    <Button size="sm" variant={saved?"secondary":"outline"} onClick={()=>toggleCollection(a.id)}>
                      {saved?"Remove":"Add"}
                    </Button>
                  </div>
                )
              })}
              {collections.length===0 && (
                <div className="text-sm text-muted-foreground">No items saved yet.</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=> setCollectionsOpen(false)} className="flex-1">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
