"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink, Search, Clock, Filter, FileText, BookOpen, Link as LinkIcon, Sparkles, X, Loader2, Download, Copy } from "lucide-react"
import { toast } from "sonner"

type ScholarItem = {
  title?: string
  link?: string
  snippet?: string
  publication_info?: any
  authors?: Array<{ name?: string; link?: string }>
  year?: number
  cited_by?: number
  cited_by_link?: string
  pdf?: string
}

export function ScholarSearch() {
  const [q, setQ] = useState("")
  const [asYlo, setAsYlo] = useState<number | undefined>(undefined)
  const [asYhi, setAsYhi] = useState<number | undefined>(undefined)
  const [scisbd, setScisbd] = useState<"0" | "1" | "2">("0")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ScholarItem[]>([])
  const [rawMode, setRawMode] = useState(false)
  const [lastQuery, setLastQuery] = useState<string>("")
  const [lastDuration, setLastDuration] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const yearOptions = useMemo(() => {
    const y: number[] = []
    const current = new Date().getFullYear()
    for (let i = current; i >= 1980; i--) y.push(i)
    return y
  }, [])

  const runSearch = useCallback(async () => {
    if (!q?.trim()) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)
    setLastQuery(q)
    try {
      const t0 = performance.now()
      const params = new URLSearchParams()
      params.set("q", q)
      if (asYlo) params.set("as_ylo", String(asYlo))
      if (asYhi) params.set("as_yhi", String(asYhi))
      if (scisbd) params.set("scisbd", scisbd)
      const resp = await fetch(`/api/scholar?${params.toString()}`, { signal: controller.signal, cache: "no-store" })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || `Query failed: ${resp.status}`)
      setResults(Array.isArray(data?.normalized) ? data.normalized : [])
      setLastDuration(Math.round(performance.now() - t0))
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message || "Search failed")
      }
    } finally {
      setLoading(false)
    }
  }, [q, asYlo, asYhi, scisbd])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") runSearch()
    if (e.key === "Escape") setQ("")
  }

  const clearAll = () => {
    setQ("")
    setAsYlo(undefined)
    setAsYhi(undefined)
    setScisbd("0")
    setResults([])
    setLastQuery("")
    setLastDuration(null)
  }

  // Handy presets for researchers
  const presets = [
    "author:Padmasambhava pilgrimage rituals",
    "monastery architecture symbolism",
    "source:Journal comparative buddhist studies",
    "buddhist cham dance iconography",
  ]

  const randomPreset = () => {
    const p = presets[Math.floor(Math.random() * presets.length)]
    setQ(p)
  }

  const openAllPdfs = () => {
    const pdfs = results.map(r => r.pdf).filter(Boolean) as string[]
    if (pdfs.length === 0) return
    const maxOpen = Math.min(pdfs.length, 5)
    for (let i = 0; i < maxOpen; i++) {
      window.open(pdfs[i], "_blank")
    }
  }

  const highlight = useCallback((text?: string) => {
    if (!text) return null
    const qWords = (q || "").toLowerCase().split(/\s+/).filter(Boolean)
    if (qWords.length === 0) return text
    const parts = text.split(new RegExp(`(${qWords.map(w => w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`, "gi"))
    return parts.map((p, i) =>
      qWords.some(w => w && p.toLowerCase() === w) ? (
        <mark key={i} className="bg-yellow-200/60 dark:bg-yellow-300/30 rounded px-0.5">{p}</mark>
      ) : (
        <span key={i}>{p}</span>
      )
    )
  }, [q])

  const hostOf = (url?: string) => {
    try { return url ? new URL(url).hostname.replace(/^www\./, "") : "" } catch { return "" }
  }

  const copyCitation = (r: ScholarItem) => {
    const authors = r.authors?.map(a => a.name).filter(Boolean).join(", ") || "Unknown"
    const y = r.year ? ` (${r.year})` : ""
    const title = r.title || "Untitled"
    const link = r.link || r.pdf || ""
    const cite = `${authors}${y}. ${title}. ${link}`
    navigator.clipboard?.writeText(cite).then(() => toast.success("Citation copied"))
  }

  return (
  <Card className="border-amber-200/60 bg-amber-50/30 dark:bg-amber-950/10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Google Scholar Search
            <Badge variant="secondary" className="ml-1 inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI‑Powered</Badge>
          </CardTitle>
          {lastDuration != null && (
            <div className="text-xs text-muted-foreground">{results.length} results · {lastDuration} ms</div>
          )}
        </div>
        <CardDescription>Query articles, filter by year range, and view citations or PDFs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Query and actions */}
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="e.g., Nyingma monastery history author:Samuel"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              className="pl-9 pr-8 border-black"
            />
            {q && (
              <button aria-label="Clear" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setQ("")}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={runSearch} disabled={loading || !q.trim()} className="min-w-28">
              {loading ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Searching</span>) : "Search"}
            </Button>
            <Button variant="outline" onClick={clearAll} disabled={loading}>Clear</Button>
            <Button variant="secondary" onClick={randomPreset} disabled={loading}>Preset</Button>
            <Button variant="outline" onClick={openAllPdfs} disabled={results.filter(r=>r.pdf).length===0} className="hidden sm:inline-flex"><Download className="h-4 w-4 mr-2" /> Open PDFs</Button>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Badge
              key={p}
              variant="outline"
              className="cursor-pointer hover:bg-muted max-w-full whitespace-normal break-words text-left leading-tight"
              onClick={() => setQ(p)}
            >
              {p}
            </Badge>
          ))}
        </div>

    {/* Filters */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl p-3 bg-background/70">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Year from</div>
            <Select value={asYlo ? String(asYlo) : undefined} onValueChange={(v) => setAsYlo(v === "any" ? undefined : Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Year to</div>
            <Select value={asYhi ? String(asYhi) : undefined} onValueChange={(v) => setAsYhi(v === "any" ? undefined : Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Sort / Recent additions</div>
            <Select value={scisbd} onValueChange={(v) => setScisbd(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Relevance</SelectItem>
                <SelectItem value="1">Added last year (abstracts)</SelectItem>
                <SelectItem value="2">Added last year (all)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {asYlo && <Badge variant="outline" className="max-w-full whitespace-normal break-words">From {asYlo}</Badge>}
          {asYhi && <Badge variant="outline" className="max-w-full whitespace-normal break-words">To {asYhi}</Badge>}
          {scisbd !== "0" && (
            <Badge variant="outline" className="max-w-full whitespace-normal break-words">{`Sort: ${scisbd === "1" ? "Recent (abstracts)" : "Recent (all)"}`}</Badge>
          )}
          {lastQuery && <Badge variant="secondary" className="max-w-full whitespace-normal break-words">Query: {lastQuery}</Badge>}
        </div>

        {error && (
          <div className="text-sm text-amber-600">{error}</div>
        )}

        {/* Results */}
  <div className="space-y-3">
          {results.length === 0 && !loading && lastQuery && (
            <div className="text-sm text-muted-foreground">No results found for "{lastQuery}".</div>
          )}
          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg bg-muted/30 animate-pulse h-20" />
              ))}
            </div>
          )}
          {results.map((r, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-r from-background/80 to-transparent shadow-[0_1px_0_rgba(0,0,0,0.03)] hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
              <div className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <a href={r.link} target="_blank" className="text-base font-semibold hover:underline break-words">
                    {highlight(r.title || "Untitled")}
                  </a>
                  <div className="text-xs text-muted-foreground mt-1">
                    {r.authors?.map((a) => a.name).filter(Boolean).join(", ")}
                    {r.year ? ` • ${r.year}` : ""}
                    {hostOf(r.link) && <> • {hostOf(r.link)}</>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:whitespace-nowrap">
                  {typeof r.cited_by === "number" && (
                    <a
                      href={r.cited_by_link || undefined}
                      target="_blank"
                      className="text-xs inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 ring-1 ring-amber-200"
                    >
                      Cited by {r.cited_by}
                    </a>
                  )}
                  {r.pdf && (
                    <a
                      href={r.pdf}
                      target="_blank"
                      className="text-xs inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 px-2 py-0.5 ring-1 ring-emerald-200"
                    >
                      <FileText className="h-3 w-3" /> PDF
                    </a>
                  )}
                  <button
                    onClick={() => copyCitation(r)}
                    className="text-xs inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 hover:bg-muted/80"
                  >
                    <Copy className="h-3 w-3" /> Cite
                  </button>
                </div>
              </div>
              {r.snippet && (
                <div className="text-sm text-muted-foreground px-4 pb-4 -mt-1">{highlight(r.snippet)}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


