"use client"

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin, Landmark } from "lucide-react"
import { monasteries } from "@/lib/monasteries"

type FestivalItem = {
  name: string
  date: string
  description: string
  monasteryId: string
  monasteryName: string
  district: string
  sources?: Array<{ label: string; url: string }>
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function extractMonthTags(date: string): string[] {
  const clean = date.replace(/\./g, "").replace(/–/g, "-")
  const parts = clean.split(/[,/]|\band\b/i).map((p) => p.trim())
  const hits = new Set<string>()
  for (const p of parts) {
    // Expand ranges like Feb-March or February-March
    const match = p.match(/([A-Za-z]+)\s*-\s*([A-Za-z]+)/)
    if (match) {
      const a = normalizeMonth(match[1])
      const b = normalizeMonth(match[2])
      if (a && b) {
        const ai = MONTHS.indexOf(a)
        const bi = MONTHS.indexOf(b)
        for (let i = ai; i <= bi; i++) hits.add(MONTHS[i])
        continue
      }
    }
    const single = normalizeMonth(p)
    if (single) hits.add(single)
  }
  return Array.from(hits)
}

function normalizeMonth(token: string): string | null {
  const t = token.trim().toLowerCase()
  const map: Record<string, string> = {
    jan: "January",
    january: "January",
    feb: "February",
    february: "February",
    mar: "March",
    march: "March",
    apr: "April",
    april: "April",
    may: "May",
    jun: "June",
    june: "June",
    jul: "July",
    july: "July",
    aug: "August",
    august: "August",
    sep: "September",
    sept: "September",
    september: "September",
    oct: "October",
    october: "October",
    nov: "November",
    november: "November",
    dec: "December",
    december: "December",
  }
  return map[t] ?? null
}

function groupByMonth(items: FestivalItem[], onlyMonth?: string) {
  const groups: Record<string, FestivalItem[]> = {}
  for (const it of items) {
    const tags = extractMonthTags(it.date)
    let buckets = tags.length ? tags : ["Other"]
    if (onlyMonth && onlyMonth !== "All") {
      buckets = tags.includes(onlyMonth) ? [onlyMonth] : []
    }
    for (const tag of buckets) {
      groups[tag] ||= []
      groups[tag].push(it)
    }
  }
  // Order months
  const ordered = Object.entries(groups).sort((a, b) => {
    const ai = MONTHS.indexOf(a[0])
    const bi = MONTHS.indexOf(b[0])
    if (ai === -1 && bi === -1) return a[0].localeCompare(b[0])
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
  return ordered
}

export function FestivalCalendarButton() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [month, setMonth] = useState<string>("All")
  const [district, setDistrict] = useState<string>("All")

  const data = useMemo<FestivalItem[]>(() => {
    const list: FestivalItem[] = []
    for (const m of monasteries) {
      for (const f of m.festivals) {
        list.push({
          name: f.name,
          date: f.date,
          description: f.description,
          monasteryId: m.id,
          monasteryName: m.name,
          district: m.district,
          sources: f.sources,
        })
      }
    }
    return list
  }, [])

  const districts = useMemo(() => ["All", ...Array.from(new Set(monasteries.map((m) => m.district)))], [])
  const months = useMemo(() => ["All", ...MONTHS], [])

  const filtered = useMemo(() => {
    return data.filter((f) => {
      const mOk = month === "All" || extractMonthTags(f.date).includes(month)
      const dOk = district === "All" || f.district === district
      const q = query.trim().toLowerCase()
      const qOk =
        q.length === 0 ||
        f.name.toLowerCase().includes(q) ||
        f.monasteryName.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
      return mOk && dOk && qOk
    })
  }, [data, month, district, query])

  const grouped = useMemo(() => groupByMonth(filtered, month), [filtered, month])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-amber-600 hover:bg-amber-700 text-[#1b1b1b] border shadow px-5">
          <CalendarDays className="h-4 w-4 mr-2" /> Festival Calendar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Festival Calendar</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Input placeholder="Search festivals or monasteries" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {grouped.length === 0 && (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">No festivals match your filters.</div>
            </Card>
          )}

          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            {grouped.map(([monthName, items]) => (
              <section key={monthName}>
                <h3 className="text-base font-semibold mb-3">{monthName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map((f, idx) => (
                    <Card
                      key={idx}
                      className="transition-colors bg-amber-100/70 dark:bg-amber-900/10 border-border/70 hover:border-primary/40"
                    >
                      <CardContent className="p-4 min-w-0">
                        <div className="font-semibold text-primary mb-2 leading-6 break-words">{f.name}</div>
                        <div className="mb-3 -m-1 flex flex-wrap">
                          <span className="m-1 inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 bg-white/60 text-muted-foreground">
                            <Landmark className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{f.monasteryName}</span>
                          </span>
                          <span className="m-1 inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 bg-white/60 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{f.district}</span>
                          </span>
                          <span className="m-1 inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 bg-white/60 text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{f.date}</span>
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 break-words">
                          {f.description}
                        </p>
                        {f.sources && f.sources.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {f.sources.map((s, i) => (
                              <a
                                key={i}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] px-2 py-0.5 rounded-full border bg-white/70 hover:bg-white text-primary underline-offset-2 hover:underline"
                              >
                                {s.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
