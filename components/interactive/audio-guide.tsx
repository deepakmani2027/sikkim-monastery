"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Volume2,
  VolumeX,
  Download,
  Headphones,
  Clock,
  Languages,
} from "lucide-react"

interface AudioGuideProps {
  monasteryName: string
  languages: string[]
  duration: string
  chapters: Array<{
    id: string
    title: string
    duration: string
    description: string
    content?: string // optional full text to be spoken
  }>
}

// Define a type for chapter playback state
interface ChapterPlaybackState {
  currentTime: number
  totalTime: number
  isPlaying: boolean
}

export function AudioGuide({ monasteryName, languages, duration, chapters }: AudioGuideProps) {
  const [currentChapter, setCurrentChapter] = useState(0)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0] || "English")
  const [playbackSpeed, setPlaybackSpeed] = useState("1x")
  const [isTranslating, setIsTranslating] = useState(false)
  const [seekingTime, setSeekingTime] = useState<number | null>(null)

  // Track playback state for each chapter individually
  const [chaptersPlayback, setChaptersPlayback] = useState<Record<number, ChapterPlaybackState>>(
    chapters.reduce((acc, _, index) => {
      acc[index] = { currentTime: 0, totalTime: 300, isPlaying: false }
      return acc
    }, {} as Record<number, ChapterPlaybackState>)
  )

  const audioRef = useRef<HTMLAudioElement>(null)
  const supportsTTS = typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined"
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utterQueueRef = useRef<SpeechSynthesisUtterance[] | null>(null)
  const playingRef = useRef(false)
  const translationCache = useRef<Record<string, string>>({}) // key: `${chapterIndex}:${langCode}`
  const abortRef = useRef<AbortController | null>(null)

  // Get current chapter's playback state
  const currentPlayback = chaptersPlayback[currentChapter] || { currentTime: 0, totalTime: 300, isPlaying: false }
  const isPlaying = currentPlayback.isPlaying
  const currentTime = currentPlayback.currentTime
  const totalTime = currentPlayback.totalTime

  // Update progress timer for the current chapter
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (isPlaying) {
      interval = setInterval(() => {
        setChaptersPlayback(prev => ({
          ...prev,
          [currentChapter]: {
            ...prev[currentChapter],
            currentTime: Math.min(prev[currentChapter].currentTime + 1, prev[currentChapter].totalTime)
          }
        }))
      }, 1000)
    }
    return () => interval && clearInterval(interval)
  }, [isPlaying, currentChapter])

  // Load voices for TTS
  useEffect(() => {
    if (!supportsTTS) return
    function loadVoices() {
      const v = window.speechSynthesis.getVoices()
      if (v && v.length) setVoices(v)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      if (window && window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null
    }
  }, [supportsTTS])

  // Estimate chapter total time based on words and playback speed
  useEffect(() => {
    const text = chapters[currentChapter]?.content || chapters[currentChapter]?.description || ""
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const baseWPM = 160 // approx
    const rate = parseFloat(playbackSpeed.replace("x", "")) || 1
    const seconds = Math.max(30, Math.round((words / (baseWPM * rate)) * 60))
    
    setChaptersPlayback(prev => ({
      ...prev,
      [currentChapter]: {
        ...prev[currentChapter],
        totalTime: seconds
      }
    }))
  }, [currentChapter, playbackSpeed, chapters])

  function langToCode(l: string) {
    const m: Record<string, string> = { English: "en", Hindi: "hi", Nepali: "ne", Tibetan: "bo" }
    return m[l] || "en"
  }

  // Helper: split into reasonable chunks (combine sentences up to ~450 chars)
  function chunkTextBySentences(text: string, maxLen = 450): string[] {
    const sentences = text
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
    const chunks: string[] = []
    let buf = ""
    for (const s of sentences) {
      if ((buf + " " + s).trim().length > maxLen) {
        if (buf) chunks.push(buf.trim())
        buf = s
      } else {
        buf = (buf + " " + s).trim()
      }
    }
    if (buf) chunks.push(buf.trim())
    return chunks
  }

  // Helper: fetch with timeout support
  async function fetchWithTimeout(url: string, opts: RequestInit & { timeoutMs?: number } = {}): Promise<Response> {
    const { timeoutMs = 6000, ...rest } = opts
    const timeout = new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeoutMs)
    )
    return Promise.race([fetch(url, rest), timeout]) as Promise<Response>
  }

  async function translateTextMyMemory(text: string, from: string, to: string): Promise<string> {
    // Batch into larger chunks and translate with limited parallelism for speed
    const chunks = chunkTextBySentences(text, 450)
    if (chunks.length === 0) return text

    const signal = abortRef.current?.signal

    async function translateChunk(s: string) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(s)}&langpair=${from}|${to}`
      try {
        const r = await fetchWithTimeout(url, { signal, cache: "no-store" })
        const j = await r.json().catch(() => ({} as any))
        return (j?.responseData?.translatedText as string) || s
      } catch {
        // On any error or timeout, fall back to original chunk so we don't block playback
        return s
      }
    }

    // Run up to 3 requests in parallel
    const concurrency = Math.min(3, chunks.length)
    const out: string[] = new Array(chunks.length)
    let i = 0
    const worker = async () => {
      while (i < chunks.length) {
        const idx = i++
        out[idx] = await translateChunk(chunks[idx])
      }
    }
    await Promise.all(Array.from({ length: concurrency }, worker))
    return out.join(" ")
  }

  async function getSpokenTextForLanguage(text: string, languageLabel: string, chapterIndex: number): Promise<string> {
    const to = langToCode(languageLabel)
    const from = "en"
    if (to === from) return text
    // We currently translate for Hindi and Nepali; Tibetan falls back to English
    if (!["hi", "ne"].includes(to)) return text
    const key = `${chapterIndex}:${to}`
    if (translationCache.current[key]) return translationCache.current[key]
    setIsTranslating(true)
    try {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const translated = await translateTextMyMemory(text, from, to)
      translationCache.current[key] = translated
      return translated
    } catch {
      return text
    } finally {
      setIsTranslating(false)
    }
  }

  function pickVoiceFor(code: string) {
    const lowerVoices = voices
    // Direct match first
    let voice = lowerVoices.find((v) => v.lang?.toLowerCase().startsWith(code))
    // For Nepali, many systems lack 'ne' voices; Hindi is a reasonable fallback
    if (!voice && code === "ne") voice = lowerVoices.find((v) => v.lang?.toLowerCase().startsWith("hi"))
    // Prefer Indian English if still none
    if (!voice) voice = lowerVoices.find((v) => v.lang?.toLowerCase().startsWith("en-in"))
    // Generic English as last resort
    if (!voice) voice = lowerVoices.find((v) => v.lang?.toLowerCase().startsWith("en"))
    return voice
  }

  function buildUtterances(text: string, targetCode?: string) {
    const code = targetCode || langToCode(selectedLanguage)
    const voice = pickVoiceFor(code)
    const rate = parseFloat(playbackSpeed.replace("x", "")) || 1
    const vol = (isMuted ? 0 : volume[0]) / 100
    // Chunk by sentences to avoid very long utterances
    const sentences = text
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
    const chunks: string[] = []
    let buf = ""
    sentences.forEach((s) => {
      if ((buf + " " + s).trim().length > 180) {
        if (buf) chunks.push(buf.trim())
        buf = s
      } else {
        buf = (buf + " " + s).trim()
      }
    })
    if (buf) chunks.push(buf.trim())
    const uts = chunks.map((chunk) => {
      const u = new SpeechSynthesisUtterance(chunk)
      if (voice) u.voice = voice
      // Explicitly set language to help pronunciation
      u.lang = code
      u.rate = rate
      u.volume = vol
      return u
    })
    return uts
  }

  function cancelSpeech() {
    try {
      window.speechSynthesis.cancel()
    } catch {}
    utterQueueRef.current = null
    playingRef.current = false
  }

  async function playChapterAtIndex(targetIndex: number) {
    if (!supportsTTS) return
    const baseText = chapters[targetIndex]?.content || chapters[targetIndex]?.description || ""
    if (!baseText) return
    const text = await getSpokenTextForLanguage(baseText, selectedLanguage, targetIndex)
    cancelSpeech()
    const queue = buildUtterances(text, langToCode(selectedLanguage))
    utterQueueRef.current = queue
    playingRef.current = true

    // Update playback state for this chapter
    setChaptersPlayback(prev => ({
      ...prev,
      [targetIndex]: {
        ...prev[targetIndex],
        isPlaying: true
      }
    }))

    queue.forEach((u, i) => {
      if (i === queue.length - 1) {
        u.onend = () => {
          playingRef.current = false
          setChaptersPlayback(prev => ({
            ...prev,
            [targetIndex]: {
              ...prev[targetIndex],
              isPlaying: false
            }
          }))
        }
      }
      window.speechSynthesis.speak(u)
    })
  }

  async function playCurrentChapter() {
    return playChapterAtIndex(currentChapter)
  }

  const togglePlay = () => {
    if (!supportsTTS) {
      setChaptersPlayback(prev => ({
        ...prev,
        [currentChapter]: {
          ...prev[currentChapter],
          isPlaying: !prev[currentChapter].isPlaying
        }
      }))
      return
    }
    
    if (!playingRef.current) {
      playCurrentChapter()
      return
    }
    
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setChaptersPlayback(prev => ({
        ...prev,
        [currentChapter]: {
          ...prev[currentChapter],
          isPlaying: true
        }
      }))
    } else {
      window.speechSynthesis.pause()
      setChaptersPlayback(prev => ({
        ...prev,
        [currentChapter]: {
          ...prev[currentChapter],
          isPlaying: false
        }
      }))
    }
  }

  const changeChapter = (newChapter: number) => {
    // Pause current chapter if playing
    if (isPlaying && supportsTTS) {
      cancelSpeech()
    }
    
    // Update current chapter
    const prev = currentChapter
    // Mark previous chapter as not playing
    setChaptersPlayback((prevState) => ({
      ...prevState,
      [prev]: { ...prevState[prev], isPlaying: false },
    }))
    setCurrentChapter(newChapter)
  }

  // Explicitly play a specific chapter and stop any previous one
  const playChapterAt = (chapterIndex: number) => {
    if (supportsTTS) cancelSpeech()
    const prev = currentChapter
    setChaptersPlayback((prevState) => ({
      ...prevState,
      [prev]: { ...prevState[prev], isPlaying: false },
      [chapterIndex]: { ...prevState[chapterIndex], currentTime: 0, isPlaying: false },
    }))
    setCurrentChapter(chapterIndex)
    // Start immediately with explicit index to avoid stale state
    playChapterAtIndex(chapterIndex)
  }

  // Toggle play/pause for a given chapter like a playlist item
  const togglePlayFor = (chapterIndex: number) => {
    if (chapterIndex !== currentChapter) {
      playChapterAt(chapterIndex)
      return
    }
    // Same chapter: just toggle
    togglePlay()
  }

  const nextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      changeChapter(currentChapter + 1)
    }
  }

  const prevChapter = () => {
    if (currentChapter > 0) {
      changeChapter(currentChapter - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = (currentTime / totalTime) * 100

  const currentChapterData = chapters[currentChapter]

  // Apply voice/rate/volume changes live by restarting if playing
  useEffect(() => {
    if (!supportsTTS) return
    if (playingRef.current) {
      playCurrentChapter()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, playbackSpeed, isMuted, volume])

  useEffect(() => {
    return () => {
      if (supportsTTS) cancelSpeech()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Prefetch translation for the current chapter on language or chapter change to reduce wait time
  useEffect(() => {
    const to = langToCode(selectedLanguage)
    if (!['hi','ne'].includes(to)) return
    const baseText = chapters[currentChapter]?.content || chapters[currentChapter]?.description || ''
    if (!baseText) return
    const key = `${currentChapter}:${to}`
    if (translationCache.current[key]) return
    let cancelled = false
    ;(async () => {
      try {
        const translated = await translateTextMyMemory(baseText, 'en', to)
        if (!cancelled) {
          translationCache.current[key] = translated
        }
      } catch {
        // ignore prefetch errors
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedLanguage, currentChapter, chapters])

  // Seek handling: estimate sentence positions and restart speech from target time
  const estimateSentenceDurations = (sentences: string[], rate: number) => {
    const baseWPM = 160
    const per: number[] = []
    for (const s of sentences) {
      const words = s.trim().split(/\s+/).filter(Boolean).length
      const secs = Math.max(0.4, (words / (baseWPM * rate)) * 60)
      per.push(secs)
    }
    return per
  }

  const splitSentences = (text: string) =>
    text
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)

  const seekTo = async (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, totalTime))
    setChaptersPlayback((prev) => ({
      ...prev,
      [currentChapter]: {
        ...prev[currentChapter],
        currentTime: clamped,
      },
    }))

    if (!supportsTTS) return
    const wasPlaying = playingRef.current && isPlaying
    // If not playing, just set time without speaking
    if (!wasPlaying) {
      cancelSpeech()
      setChaptersPlayback((prev) => ({
        ...prev,
        [currentChapter]: { ...prev[currentChapter], isPlaying: false },
      }))
      return
    }

    const baseText = chapters[currentChapter]?.content || chapters[currentChapter]?.description || ""
    if (!baseText) return
    const text = await getSpokenTextForLanguage(baseText, selectedLanguage, currentChapter)

    const sentences = splitSentences(text)
    const rate = parseFloat(playbackSpeed.replace("x", "")) || 1
    const per = estimateSentenceDurations(sentences, rate)
    let accum = 0
    let startIdx = 0
    for (let i = 0; i < per.length; i++) {
      if (accum + per[i] >= clamped) {
        startIdx = i
        break
      }
      accum += per[i]
      startIdx = i + 1
    }

    // If beyond the end, stop
    if (startIdx >= sentences.length) {
      cancelSpeech()
      playingRef.current = false
      setChaptersPlayback((prev) => ({
        ...prev,
        [currentChapter]: { ...prev[currentChapter], isPlaying: false, currentTime: totalTime },
      }))
      return
    }

    const remaining = sentences.slice(startIdx).join(" ")
    cancelSpeech()
    const queue = buildUtterances(remaining, langToCode(selectedLanguage))
    utterQueueRef.current = queue
    playingRef.current = true
    setChaptersPlayback((prev) => ({
      ...prev,
      [currentChapter]: { ...prev[currentChapter], isPlaying: true },
    }))
    queue.forEach((u, i) => {
      if (i === queue.length - 1) {
        u.onend = () => {
          playingRef.current = false
          setChaptersPlayback((prev) => ({
            ...prev,
            [currentChapter]: { ...prev[currentChapter], isPlaying: false, currentTime: totalTime },
          }))
        }
      }
      window.speechSynthesis.speak(u)
    })
  }

  const seekBy = (deltaSeconds: number) => {
    const target = Math.max(0, Math.min(totalTime, currentTime + deltaSeconds))
    void seekTo(target)
  }

  return (
    <div className="space-y-6">
      {/* Audio Guide Header */}
      <Card className="rounded-2xl border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
        <CardHeader>
          {/* Stack on mobile, align horizontally on larger screens to avoid overlap */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
            <CardTitle className="flex items-center gap-3 font-extrabold text-primary tracking-tight w-full">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
                <Headphones className="h-4 w-4" />
              </span>
              <span className="leading-tight break-words">
                Audio Guide: {monasteryName}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <Badge variant="outline" className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs">
                <Clock className="h-3 w-3" />
                {duration}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs">
                <Languages className="h-3 w-3" />
                {languages.length} languages
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Player */}
      <Card className="rounded-2xl border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
        <CardContent className="p-6">
          {/* Current Chapter Info */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-2">{currentChapterData?.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">{currentChapterData?.description}</p>
            <Badge variant="secondary">
              Chapter {currentChapter + 1} of {chapters.length}
            </Badge>
          </div>

          {/* Seek Bar */}
          <div className="space-y-3 mb-6">
            <Slider
              className="[&_[data-slot=slider-track]]:bg-amber-300 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-amber-900 [&_[data-slot=slider-thumb]]:border-amber-900"
              value={[seekingTime ?? currentTime]}
              min={0}
              max={Math.max(1, totalTime)}
              step={1}
              onValueChange={(v) => setSeekingTime(v[0] ?? 0)}
              onValueCommit={(v) => {
                const t = v[0] ?? 0
                setSeekingTime(null)
                void seekTo(t)
              }}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatTime(seekingTime ?? currentTime)}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => seekBy(-10)}>
                  <Rewind className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">10s</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => seekBy(10)}>
                  <FastForward className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">10s</span>
                </Button>
              </div>
              <span>{formatTime(totalTime)}</span>
            </div>
            {isTranslating && <div className="text-center text-xs text-muted-foreground">Translating chapter…</div>}
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={prevChapter} disabled={currentChapter === 0}>
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button size="lg" onClick={togglePlay} className="w-16 h-16 rounded-full">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>

            <Button variant="outline" size="sm" onClick={nextChapter} disabled={currentChapter === chapters.length - 1}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)}>
                {isMuted || volume[0] === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={isMuted ? [0] : volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1 [&_[data-slot=slider-track]]:bg-amber-300 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-amber-900 [&_[data-slot=slider-thumb]]:border-amber-900"
              />
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5x">0.5x</SelectItem>
                  <SelectItem value="0.75x">0.75x</SelectItem>
                  <SelectItem value="1x">1x</SelectItem>
                  <SelectItem value="1.25x">1.25x</SelectItem>
                  <SelectItem value="1.5x">1.5x</SelectItem>
                  <SelectItem value="2x">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapter List */}
      <Card className="rounded-2xl border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
        <CardHeader>
          <CardTitle>Chapters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className={`w-full p-3 rounded-lg border overflow-hidden transition-colors ${
                  currentChapter === index ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setCurrentChapter(index)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-1 min-w-0">
                      <span className="text-sm font-medium break-words">
                        {index + 1}. {chapter.title}
                      </span>
                      {currentChapter === index && isPlaying && (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-3 bg-primary animate-pulse"></div>
                          <div className="w-1 h-3 bg-primary animate-pulse delay-100"></div>
                          <div className="w-1 h-3 bg-primary animate-pulse delay-200"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground break-words">{chapter.description}</p>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {chapter.duration}
                    </Badge>
                    {chaptersPlayback[index]?.currentTime > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {formatTime(chaptersPlayback[index].currentTime)}
                      </Badge>
                    )}
                    <Button size="icon" onClick={() => togglePlayFor(index)}>
                      {currentChapter === index && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 ml-0.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download Options */}
      <Card className="rounded-2xl border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download for Offline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages.map((language) => (
              <Button key={language} variant="outline" className="justify-between bg-transparent">
                <span>{language} Audio Guide</span>
                <Download className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element for future implementation */}
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}