import { NextRequest } from "next/server"
import { monasteries } from "@/lib/monasteries"
import { archiveItems } from "@/lib/archives"

function scoreMatch(hay: string, needle: string) {
	const h = hay.toLowerCase()
	const n = needle.toLowerCase()
	if (h === n) return 100
	if (h.startsWith(n)) return 80
	if (h.includes(n)) return 60
	return 0
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const q = (searchParams.get("q") || "").trim()
	const visitedRaw = searchParams.get("visited")
	const visited: string[] = visitedRaw ? visitedRaw.split(",").filter(Boolean) : []

	// If empty query, return top picks + recommendations
	const query = q.toLowerCase()

	const monasteryResults = monasteries
		.map((m) => {
			const fields = [m.name, m.location, m.description, m.history, m.significance, ...(m.tags || [])].join("\n")
			const s = Math.max(
				scoreMatch(m.name, query),
				scoreMatch(m.location, query),
				scoreMatch(m.description, query),
				...m.tags.map((t) => scoreMatch(t, query)),
			)
			return { kind: "monastery" as const, score: s, item: m }
		})
		.filter((x) => (query ? x.score > 0 : true))
		.sort((a, b) => b.score - a.score)
		.slice(0, 10)

	const archiveResults = archiveItems
		.map((a) => ({
			kind: "archive" as const,
			score: Math.max(
				scoreMatch(a.title, query),
				scoreMatch(a.monastery, query),
				scoreMatch(a.description, query),
				scoreMatch(a.century, query),
				scoreMatch(a.type, query),
			),
			item: a,
		}))
		.filter((x) => (query ? x.score > 0 : true))
		.sort((a, b) => b.score - a.score)
		.slice(0, 10)

	// 1) Text-matched festivals
	const textMatchedFestivals = monasteries
		.flatMap((m) =>
			(m.festivals || []).map((f) => ({
				kind: "festival" as const,
				monasteryId: m.id,
				monasteryName: m.name,
				score: Math.max(scoreMatch(f.name, query), scoreMatch(f.description, query)),
				item: f,
			})),
		)
		.filter((x) => (query ? x.score > 0 : true))
		.sort((a, b) => b.score - a.score)

	// 2) Related monasteries from direct monastery results
	const matchedMonasteryIds = new Set(monasteryResults.map((x) => x.item.id))

	// 3) Related monasteries inferred from archive results (by monastery name)
	const nameToMonastery = new Map(monasteries.map((m) => [m.name.toLowerCase(), m]))
	for (const ar of archiveResults) {
		const m = nameToMonastery.get(ar.item.monastery.toLowerCase())
		if (m) matchedMonasteryIds.add(m.id)
	}

	// 4) Gather all festivals for the matched monasteries
	const relatedFestivals = Array.from(matchedMonasteryIds).flatMap((id) => {
		const m = monasteries.find((mm) => mm.id === id)
		return (m?.festivals || []).map((f) => ({
			kind: "festival" as const,
			monasteryId: m!.id,
			monasteryName: m!.name,
			// high score to keep related items even if text doesn't match
			score: 1000,
			item: f,
		}))
	})

	// 5) Merge and dedupe festivals by monasteryId + name
	const allFestivalsMap = new Map<string, typeof textMatchedFestivals[number]>()
	for (const hit of [...relatedFestivals, ...textMatchedFestivals]) {
		const key = `${hit.monasteryId}|${hit.item.name}`
		if (!allFestivalsMap.has(key)) allFestivalsMap.set(key, hit)
	}
	const festivalResults = Array.from(allFestivalsMap.values())
			.sort((a, b) => b.score - a.score)

	// Simple recommendations: if visited includes a monastery, recommend others in same district or nearby tags
	const visitedSet = new Set(visited)
	const recent = monasteries.filter((m) => visitedSet.has(m.id))
	const recs = monasteries
		.filter((m) => !visitedSet.has(m.id))
		.map((m) => {
			let s = 0
			for (const v of recent) {
				if (v.district === m.district) s += 30
				const tagOverlap = m.tags.filter((t) => v.tags.includes(t)).length
				s += tagOverlap * 10
			}
			return { score: s, item: m }
		})
		.filter((x) => x.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 6)

	return Response.json({
		query: q,
		categories: {
			monasteries: monasteryResults.map((x) => x.item),
			festivals: festivalResults,
			archives: archiveResults.map((x) => x.item),
		},
		recommendations: recs.map((x) => x.item),
	})
}
