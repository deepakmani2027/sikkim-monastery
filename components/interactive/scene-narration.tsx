"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Globe2, Volume2, VolumeX } from "lucide-react"

type LangCode = "en" | "hi" | "ne" | "fr" | "ja" | "zh"

export interface NarrationMap {
	[lang: string]: {
		text: string
		audioUrl?: string
	}
}

interface SceneNarrationProps {
	narration?: NarrationMap
	defaultLangs?: LangCode[]
}

export function SceneNarration({ narration, defaultLangs = ["en", "hi", "ne", "fr", "ja", "zh"] }: SceneNarrationProps) {
	const availableLangs = useMemo(() => {
		const keys = narration ? Object.keys(narration) : []
		const ordered = defaultLangs.filter((l) => keys.includes(l))
		return ordered.length ? ordered : keys
	}, [narration, defaultLangs])

	const [lang, setLang] = useState<LangCode | string>(availableLangs[0] || "en")
	const [isPlaying, setIsPlaying] = useState(false)
	const [muted, setMuted] = useState(false)
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const [blobUrl, setBlobUrl] = useState<string | null>(null)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		setLang(availableLangs[0] || "en")
	}, [availableLangs.join(",")])

	useEffect(() => {
		return () => {
			if (blobUrl) URL.revokeObjectURL(blobUrl)
		}
	}, [blobUrl])

	const current = narration?.[lang]

	const ensureAudio = async () => {
		setError(null)
		if (!current?.text) return null
		if (current.audioUrl) return current.audioUrl
		// Try TTS endpoint if available
		try {
			setBusy(true)
			const res = await fetch("/api/tts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: current.text, lang }),
			})
			if (!res.ok) throw new Error(`TTS failed: ${res.status}`)
			const blob = await res.blob()
			const url = URL.createObjectURL(blob)
			setBlobUrl(url)
			return url
		} catch (e: any) {
			setError("Narration audio unavailable. Showing text only.")
			return null
		} finally {
			setBusy(false)
		}
	}

	const togglePlay = async () => {
		if (!audioRef.current) return
		if (!isPlaying) {
			let src = current?.audioUrl || blobUrl
			if (!src) src = await ensureAudio()
			if (!src) return
			audioRef.current.src = src
			audioRef.current.muted = muted
			await audioRef.current.play().catch(() => {})
			setIsPlaying(true)
		} else {
			audioRef.current.pause()
			setIsPlaying(false)
		}
	}

	return (
		<Card className="border bg-muted/40">
			<CardContent className="p-4 space-y-3">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="uppercase">Narration</Badge>
						{busy && <span className="text-xs text-muted-foreground">Generating audio…</span>}
						{error && <span className="text-xs text-red-500">{error}</span>}
					</div>
					<div className="flex items-center gap-2">
						<Select value={lang} onValueChange={setLang}>
							<SelectTrigger className="w-[160px]">
								<Globe2 className="h-4 w-4 mr-2" />
								<SelectValue placeholder="Language" />
							</SelectTrigger>
							<SelectContent>
								{availableLangs.map((l) => (
									<SelectItem key={l} value={l}>
										{l === "en" && "English"}
										{l === "hi" && "Hindi"}
										{l === "ne" && "Nepali"}
										{l === "fr" && "French"}
										{l === "ja" && "Japanese"}
										{l === "zh" && "Chinese"}
										{!["en", "hi", "ne", "fr", "ja", "zh"].includes(l) && l}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button variant="outline" size="sm" onClick={() => setMuted((m) => !m)}>
							{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
						</Button>
						<Button size="sm" onClick={togglePlay} disabled={!current?.text}>
							{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
							<span className="ml-2">{isPlaying ? "Pause" : "Play"}</span>
						</Button>
					</div>
				</div>

				<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
					{current?.text || "Narration unavailable for this scene."}
				</p>

				<audio ref={audioRef} onEnded={() => setIsPlaying(false)} hidden />
			</CardContent>
		</Card>
	)
}

export default SceneNarration

