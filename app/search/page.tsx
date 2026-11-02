"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FestivalCalendarButton } from "@/components/interactive/festival-calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search as SearchIcon } from "lucide-react"

type FestivalHit = {
	kind: "festival"
	monasteryId: string
	monasteryName: string
	item: { name: string; date: string; description: string }
}

export default function SearchPage() {
	const [q, setQ] = useState("")
	const [loading, setLoading] = useState(false)
	const [data, setData] = useState<any>(null)
	const [archiveOpen, setArchiveOpen] = useState(false)
	const [activeArchive, setActiveArchive] = useState<any | null>(null)

	function statusClass(status?: string) {
		if (status === "Excellent") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
		if (status === "Good") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
		return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
	}

	const visited = useMemo(() => {
		try {
			const raw = localStorage.getItem("recent-monasteries")
			return raw ? (JSON.parse(raw) as string[]) : []
		} catch {
			return []
		}
	}, [])

	async function runSearch(query: string) {
			const q = (query || "").trim()
			if (!q) {
				setData(null)
				return
			}
			setLoading(true)
			try {
				const url = `/api/search?q=${encodeURIComponent(q)}&visited=${encodeURIComponent(visited.join(","))}`
				const res = await fetch(url)
				const json = await res.json()
				setData(json)
			} finally {
				setLoading(false)
			}
	}

	function onPreviewArchive(item: any) {
		setActiveArchive(item)
		setArchiveOpen(true)
	}


	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
							<section className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
								<div className="relative flex-1 group">
									<SearchIcon className="pointer-events-none absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
									<Input
										value={q}
										onChange={(e) => setQ(e.target.value)}
										onKeyDown={(e) => { if (e.key === 'Enter') runSearch(q) }}
										aria-label="Search monasteries, festivals, archives"
										placeholder="Search monasteries, festivals, archives..."
										className="h-11 sm:h-12 pl-10 sm:pl-12 pr-4 rounded-xl border border-foreground/15 shadow-sm"
									/>
								</div>
								<Button className="h-11 sm:h-12 px-6 rounded-2xl shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto" onClick={() => runSearch(q)} disabled={loading}>
									{loading ? "Searching..." : "Search"}
								</Button>
							</section>

				{data && (
					<div className="space-y-10">
						<section>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-2xl font-bold">Monasteries{Array.isArray(data.categories?.monasteries) ? ` (${data.categories.monasteries.length})` : ""}</h2>
							</div>
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{data.categories?.monasteries?.map((m: any) => (
									<Card key={m.id} className="overflow-hidden border-border/60 py-0 gap-0">
										<div className="relative h-56 sm:h-64 lg:h-72 rounded-t-xl overflow-hidden">
											<Image src={m.images?.[0] || "/placeholder.jpg"} alt={m.name} fill className="object-cover" />
											<div className="absolute left-3 top-3"><Badge className="bg-neutral-900/70 text-white">Monastery</Badge></div>
										</div>
										<CardContent className="p-6 sm:p-8 space-y-4">
											<h3 className="font-extrabold text-2xl sm:text-3xl leading-tight text-primary">{m.name}</h3>
											<p className="text-sm sm:text-base text-muted-foreground line-clamp-2">{m.description}</p>
											<div className="pt-1">
												<Button
													asChild
													className="h-12 px-6 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
												>
													<Link href={`/monastery/${m.id}`}>View details</Link>
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</section>

						<section>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-2xl font-bold">Festivals{Array.isArray(data.categories?.festivals) ? ` (${data.categories.festivals.length})` : ""}</h2>
								<div className="hidden sm:block"><FestivalCalendarButton /></div>
							</div>
							<div className="space-y-4">
								{data.categories?.festivals?.map((f: FestivalHit, idx: number) => (
									<Card
										key={idx}
										className="bg-amber-50/80 border border-amber-300/60 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all py-0 gap-0"
									>
										<CardContent className="p-5 sm:p-6 flex items-start justify-between gap-4">
											<div className="min-w-0">
												<div className="flex items-center gap-3">
													<Badge variant="secondary" className="bg-amber-200 text-amber-900">Festival</Badge>
													<span className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-xs ring-1 ring-amber-200">
														{f.item.date}
													</span>
												</div>
												<h3 className="mt-2 text-xl sm:text-1xl font-extrabold text-primary">{f.item.name}</h3>
												<p className="text-sm sm:text-base text-foreground/80">{f.monasteryName}</p>
												<p className="mt-2 text-sm sm:text-base text-muted-foreground line-clamp-2">{f.item.description}</p>
											</div>
											<div className="flex items-center gap-2 self-center">
												<Button asChild variant="outline" className="h-10 rounded-full border-primary/30 text-primary hover:bg-primary/10">
													<Link href={`/monastery/${f.monasteryId}`}>View Monastery</Link>
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</section>

						<section>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-2xl font-bold">Archives{Array.isArray(data.categories?.archives) ? ` (${data.categories.archives.length})` : ""}</h2>
							</div>
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{data.categories?.archives?.map((a: any) => (
									<Card key={a.id} className="overflow-hidden border-border/60 py-0 gap-0">
										<div className="relative h-56 sm:h-64 lg:h-72 rounded-t-xl overflow-hidden">
											<Image src={a.image} alt={a.title} fill className="object-cover" />
											<div className="absolute left-3 top-3"><Badge className="bg-neutral-900/70 text-white">Archive</Badge></div>
										</div>
														<CardContent className="p-6 sm:p-8 space-y-3">
															<h3 className="font-extrabold text-xl sm:text-2xl leading-tight text-primary">{a.title}</h3>
															<div className="w-fit">
																<span className="inline-flex items-center rounded-full border border-foreground/15 bg-white/70 dark:bg-neutral-900/50 px-3 py-1 text-xs sm:text-sm text-foreground shadow-sm backdrop-blur">
																	{a.monastery} • {a.century}
																</span>
															</div>
											<p className="text-sm sm:text-base text-muted-foreground line-clamp-2">{a.description}</p>
											<div className="pt-1">
												<Button className="h-12 px-6 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onPreviewArchive(a)}>
													Preview
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</section>

						<section>
							<h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
							{data.recommendations?.length ? (
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{data.recommendations.map((m: any) => (
										<Card key={m.id} className="overflow-hidden border-border/60">
											<div className="relative h-44">
												<Image src={m.images?.[0] || "/placeholder.jpg"} alt={m.name} fill className="object-cover" />
												<div className="absolute left-3 top-3"><Badge className="bg-neutral-900/70 text-white">Recommended</Badge></div>
											</div>
											<CardContent className="p-4 space-y-2">
												<h3 className="font-semibold text-lg leading-tight">{m.name}</h3>
												<p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
												<div className="pt-2">
													<Button asChild variant="secondary" size="sm">
														<Link href={`/monastery/${m.id}`}>Explore</Link>
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">Start visiting monasteries to see personalized recommendations.</p>
							)}
						</section>
					</div>
				)}
			</main>
	
					{/* Archive Preview Dialog */}
					<Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
						<DialogContent className="w-[96vw] sm:max-w-3xl md:max-w-4xl p-4 sm:p-6">
							{activeArchive && (
								<div>
									<DialogHeader>
										<DialogTitle className="text-xl sm:text-3xl font-bold">{activeArchive.title}</DialogTitle>
										<DialogDescription className="text-sm sm:text-base text-muted-foreground">
											{activeArchive.monastery} • {activeArchive.century}
										</DialogDescription>
									</DialogHeader>
									<div className="relative mt-3 sm:mt-4 h-72 sm:h-96 rounded overflow-hidden">
										<Image src={activeArchive.image} alt={activeArchive.title} fill className="object-cover" />
									</div>
									<p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">{activeArchive.description}</p>

									<div className="mt-5 sm:mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 text-sm sm:text-base">
										<div className="flex items-center justify-between border-t pt-3">
											<span className="font-medium">Language:</span>
											<span>{activeArchive.language || "—"}</span>
										</div>
										<div className="flex items-center justify-between border-t pt-3">
											<span className="font-medium">Material:</span>
											<span>{activeArchive.material || "—"}</span>
										</div>
										<div className="flex items-center justify-between border-t pt-3">
											<span className="font-medium">Dimensions:</span>
											<span>{activeArchive.dimensions || "—"}</span>
										</div>
										<div className="flex items-center justify-between border-t pt-3">
											<span className="font-medium">Date Acquired:</span>
											<span>{activeArchive.dateAcquired || "—"}</span>
										</div>
										<div className="flex items-center justify-between border-t pt-3 sm:col-span-2">
											<span className="font-medium">Conservation Status:</span>
											<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs sm:text-sm ${statusClass(activeArchive.status)}`}>{activeArchive.status || "—"}</span>
										</div>
									</div>
								</div>
							)}
						</DialogContent>
					</Dialog>

				</div>
	)
}
