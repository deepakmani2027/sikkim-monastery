"use client"

import { useEffect, useMemo, useState } from "react"

type Props = {
	name: string
	lat: number
	lng: number
	max?: number
	fallbackImages?: string[]
}

type Photo = { name?: string; ref?: string; width: number; height: number; attributions?: string[] }

export function GooglePhotosGrid({ name, lat, lng, max = 12, fallbackImages = [] }: Props) {
	const [photos, setPhotos] = useState<Photo[] | null>(null)
	const [placeId, setPlaceId] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [limit, setLimit] = useState<number>(max)
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

	const photoUrl = (photo: Photo) =>
		photo.ref?.startsWith("/")
			? photo.ref
			:
		photo.name
			? `/api/services/places?photoName=${encodeURIComponent(photo.name)}`
			: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${Math.min(1600, Math.max(400, photo.width))}&photo_reference=${encodeURIComponent(
					photo.ref || ""
			  )}&key=${encodeURIComponent(apiKey)}`

	useEffect(() => {
		let active = true
		async function run() {
			try {
				setLoading(true)
				setError(null)
				// Find the place by text near the monastery coordinates
				const findRes = await fetch(
					`/api/services/places?text=${encodeURIComponent(`${name} Sikkim`)}&near=${lat},${lng}&radius=20000`,
				)
				let found = await findRes.json()
				let cand =
					found.results?.find((result: any) =>
						String(result.name || "").toLowerCase().includes(name.split(" ")[0].toLowerCase()),
					) || found.results?.[0]
				if (!cand?.id) {
					const fallbackRes = await fetch(
						`/api/services/places?text=${encodeURIComponent(`monastery near ${name}`)}&near=${lat},${lng}&radius=5000`,
					)
					found = await fallbackRes.json()
					cand = found.results?.[0]
				}
				if (!cand?.id) throw new Error(found?.error || "Google Place not found")
				if (!active) return
				setPlaceId(cand.id)
				// Fetch details including photos
				const detRes = await fetch(`/api/services/places?placeId=${cand.id}`)
				const det = await detRes.json()
				const ph: Photo[] = det?.result?.photos || []
				if (!active) return
				setPhotos(ph)
			} catch (e: any) {
				if (!active) return
				setError(e?.message || "Failed to load photos")
				setPhotos(
					fallbackImages.map((image) => ({
						ref: image,
						width: 1200,
						height: 800,
					})),
				)
			} finally {
				if (active) setLoading(false)
			}
		}
		run()
		return () => {
			active = false
		}
	}, [name, lat, lng, max, fallbackImages])

	const placeLink = useMemo(
		() => (placeId ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}` : null),
		[placeId],
	)

	return (
		<div className="space-y-2">
			{loading && <div className="text-sm text-muted-foreground">Loading photos…</div>}
			{error && (
				<div className="text-sm text-amber-600">
					{error}. Showing the monastery&apos;s verified local media instead.
				</div>
			)}
			{photos && photos.length > 0 ? (
				<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
					{photos.slice(0, limit).map((p) => (
						<a key={p.name || p.ref} href={photoUrl(p)} target="_blank" rel="noreferrer" className="block">
							<img
								src={photoUrl(p)}
								alt={name}
								className="w-full h-32 md:h-40 object-cover rounded"
								loading="lazy"
							/>
						</a>
					))}
				</div>
			) : (
				!loading && <div className="text-sm text-muted-foreground">No photos found.</div>
			)}
			{photos && photos.length > limit && (
				<div>
					<button className="text-sm underline text-primary" onClick={() => setLimit((n) => Math.min(60, n + 12))}>
						Show more
					</button>
				</div>
			)}
			{placeLink && (
				<div className="text-xs">
					<a href={placeLink} target="_blank" className="underline text-primary">
						View more on Google Maps
					</a>
				</div>
			)}
		</div>
	)
}
