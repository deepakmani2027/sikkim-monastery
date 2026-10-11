"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import "pannellum/build/pannellum.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Info,
  Volume2,
  VolumeX,
  Maximize,
  ArrowLeft,
  ArrowRight,
  Smartphone,
} from "lucide-react"

interface VirtualTourProps {
  monasteryId: string
  scenes: Array<{
    id: string
    title: string
    image: string
    videoUrl?: string
    haov?: number
    vaov?: number
    vOffset?: number
    hotspots?: Array<{
      pitch: number
      yaw: number
      type: string
      text: string
      sceneId?: string
    }>
    narration?: {
      // BCP-47 language code (e.g., 'en', 'hi', 'ne', 'bo', 'fr', 'ja', 'zh-CN')
      [langCode: string]: {
        text?: string
        audioUrl?: string
      }
    }
  }>
}

// Dynamically import ReactPannellum (default export) to avoid SSR issues
const ReactPannellum = dynamic(() => import("react-pannellum").then((m: any) => m.default), { ssr: false }) as any

export function VirtualTour({ monasteryId, scenes }: VirtualTourProps) {
  const [currentScene, setCurrentScene] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHotspots, setShowHotspots] = useState(true)
  const [tourProgress, setTourProgress] = useState(0)
  const apiRef = useRef<any>(null)
  const [gyroOn, setGyroOn] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [resolvedImage, setResolvedImage] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [narrationPlaying, setNarrationPlaying] = useState(false)
  const [selectedLang, setSelectedLang] = useState<string>("en")
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  const currentSceneData = scenes[currentScene]
  const pannellumKey = useMemo(() => currentSceneData?.id ?? `scene-${currentScene}`, [currentSceneData?.id, currentScene])

  // Load API functions after mount
  useEffect(() => {
    let mounted = true
    import("react-pannellum").then((mod) => {
      if (mounted) apiRef.current = mod
    })
    return () => {
      mounted = false
    }
  }, [])

  // Preload current scene image to avoid pannellum error screen; use placeholder on error
  useEffect(() => {
    if (!currentSceneData || currentSceneData.videoUrl) {
      setResolvedImage(null)
      return
    }
    const src = currentSceneData.image || "/placeholder.jpg"
    let isMounted = true
    const img = new Image()
    img.onload = () => {
      if (isMounted) setResolvedImage(src)
    }
    img.onerror = () => {
      if (isMounted) setResolvedImage("/placeholder.jpg")
    }
    img.src = src
    return () => {
      isMounted = false
    }
  }, [currentSceneData?.image, currentSceneData?.videoUrl])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setTourProgress((prev) => {
          if (prev >= 100) {
            if (currentScene < scenes.length - 1) {
              setCurrentScene((prev) => prev + 1)
              return 0
            } else {
              setIsPlaying(false)
              return 100
            }
          }
          return prev + 1
        })
      }, 200)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentScene, scenes.length])

  const handleSceneChange = (sceneIndex: number) => {
    setCurrentScene(sceneIndex)
    setTourProgress(0)
    stopNarration()
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const resetTour = () => {
    setCurrentScene(0)
    setTourProgress(0)
    setIsPlaying(false)
    stopNarration()
  }

  const nextScene = () => {
    if (currentScene < scenes.length - 1) {
      handleSceneChange(currentScene + 1)
    }
  }

  const prevScene = () => {
    if (currentScene > 0) {
      handleSceneChange(currentScene - 1)
    }
  }

  const zoomIn = () => {
    const api = apiRef.current
    if (!api?.getHfov || !api?.setHfov) return
    const hfov = api.getHfov()
    api.setHfov(Math.max(30, hfov - 10))
  }

  const zoomOut = () => {
    const api = apiRef.current
    if (!api?.getHfov || !api?.setHfov) return
    const hfov = api.getHfov()
    api.setHfov(Math.min(120, hfov + 10))
  }

  const toggleFullscreen = () => {
    setIsFullscreen((f) => !f)
    const api = apiRef.current
    if (api?.toggleFullscreen) api.toggleFullscreen()
  }

  const toggleGyro = async () => {
    const api = apiRef.current
    if (!api) return
    if (gyroOn) {
      api.stopOrientation?.()
      setGyroOn(false)
      return
    }
    const orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">
    }
    if (orientation?.requestPermission) {
      const permission = await orientation.requestPermission()
      if (permission !== "granted") return
    }
    const viewer = api.getViewer?.(`vt-${monasteryId}`) || api
    viewer.startOrientation?.()
    setGyroOn(true)
  }

  const handleHotspotClick = (sceneId?: string) => {
    if (!sceneId) return
    const idx = scenes.findIndex((s) => s.id === sceneId)
    if (idx >= 0) handleSceneChange(idx)
  }

  // ----- Narration helpers (audioUrl or TTS fallback) -----
  const currentNarration = currentSceneData?.narration || {}
  const narrationForLang = useMemo(() => {
    // Try selected language, then generic base language, then English fallback
    if (!currentNarration) return undefined
    const exact = currentNarration[selectedLang]
    if (exact) return exact
    // If selectedLang like zh-CN, try zh
    const base = selectedLang.split("-")[0]
    if (currentNarration[base]) return currentNarration[base]
    return currentNarration["en"]
  }, [currentNarration, selectedLang])

  const preferredLangCode = useMemo(() => {
    if (!narrationForLang) return "en"
    // Use the selected language base code for TTS
    const code = selectedLang.includes("-") ? selectedLang : selectedLang
    return code
  }, [narrationForLang, selectedLang])

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    let mounted = true
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (mounted) setAvailableVoices(voices)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      mounted = false
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const stopNarration = () => {
    try {
      audioRef.current?.pause()
      if (audioRef.current) audioRef.current.currentTime = 0
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    } catch {}
    setNarrationPlaying(false)
  }

  const playNarration = () => {
    if (!narrationForLang) return
    // Prefer audioUrl if provided
    if (narrationForLang.audioUrl) {
      if (!audioRef.current) return
      audioRef.current.src = narrationForLang.audioUrl
      audioRef.current.muted = isMuted
      audioRef.current.play().then(() => setNarrationPlaying(true)).catch(() => setNarrationPlaying(false))
      return
    }
    // Fallback to client TTS if text exists
    if (typeof window !== "undefined" && window.speechSynthesis && narrationForLang.text) {
      try {
        const utter = new SpeechSynthesisUtterance(narrationForLang.text)
        utter.lang = preferredLangCode
        utter.rate = 1
        utter.pitch = 1
        utter.volume = isMuted ? 0 : 1
        // Try to pick a matching voice
        const base = preferredLangCode.split("-")[0]
        const match = availableVoices.find((v) => v.lang.startsWith(preferredLangCode) || v.lang.startsWith(base))
        if (match) utter.voice = match
        utter.onend = () => setNarrationPlaying(false)
        utter.onerror = () => setNarrationPlaying(false)
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utter)
        setNarrationPlaying(true)
        return
      } catch {}
    }
    setNarrationPlaying(false)
  }

  const renderVideoScene = (url: string) => {
    const u = url.trim()
    const isYouTube = /youtube\.com\/watch\?v=|youtu\.be\//i.test(u)
    const isVimeo = /vimeo\.com\//i.test(u)
    if (isYouTube) {
      let videoId = ""
      const ytIdMatch = u.match(/[?&]v=([^&]+)/)
      if (ytIdMatch) videoId = ytIdMatch[1]
      const shortMatch = u.match(/youtu\.be\/([^?&]+)/)
      if (!videoId && shortMatch) videoId = shortMatch[1]
      const embed = `https://www.youtube.com/embed/${videoId}`
      return (
        <iframe
          src={embed}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )
    }
    if (isVimeo) {
      const vm = u.match(/vimeo\.com\/(\d+)/)
      const id = vm?.[1]
      const embed = id ? `https://player.vimeo.com/video/${id}` : u
      return (
        <iframe
          src={embed}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )
    }
    return <video src={u} controls className="w-full h-full object-contain" />
  }

  return (
    <div className="space-y-4">
      {/* Tour Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm">360°</span>
              </div>
              Virtual Tour: {currentSceneData?.title}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Narration</span>
                <Select value={selectedLang} onValueChange={(v) => { setSelectedLang(v); stopNarration() }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { code: "en", label: "English" },
                      { code: "hi", label: "Hindi" },
                      { code: "ne", label: "Nepali" },
                      { code: "bo", label: "Tibetan" },
                      { code: "fr", label: "French" },
                      { code: "ja", label: "Japanese" },
                      { code: "zh-CN", label: "Chinese" },
                    ].map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (narrationPlaying ? stopNarration() : playNarration())}
                >
                  {narrationPlaying ? "Pause narration" : "Play narration"}
                </Button>
              </div>
              <Badge variant="secondary">
                Scene {currentScene + 1} of {scenes.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tour Viewer */}
      <Card className={`overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
        <CardContent className="p-0 relative">
          {/* 360° Interactive Viewer */}
          <div className={`relative bg-black ${isFullscreen ? "h-screen" : "h-[70vh]"}`}>
            {ReactPannellum && !currentSceneData?.videoUrl && (
              <ReactPannellum
                key={`${pannellumKey}-${resolvedImage || "loading"}`}
                id={`vt-${monasteryId}`}
                sceneId={pannellumKey}
                imageSource={resolvedImage || "/placeholder.jpg"}
                config={{
                  autoLoad: true,
                  showZoomCtrl: false,
                  showFullscreenCtrl: false,
                  mouseZoom: true,
                  draggable: true,
                  autoRotate: isPlaying ? -2 : 0,
                  hfov: 90,
                  minHfov: 10,
                  maxHfov: 120,
                  compass: true,
                  keyboardZoom: true,
                  doubleClickZoom: true,
                  haov: currentSceneData?.haov,
                  vaov: currentSceneData?.vaov,
                  vOffset: currentSceneData?.vOffset,
                  hotSpots:
                    showHotspots && currentSceneData?.hotspots
                      ? currentSceneData.hotspots.map((h) => ({
                          pitch: h.pitch,
                          yaw: h.yaw,
                          type: h.type as any,
                          text: h.text,
                          sceneId: h.sceneId,
                          clickHandlerFunc: h.type === "scene" ? () => handleHotspotClick(h.sceneId) : undefined,
                        }))
                      : undefined,
                }}
                style={{ width: "100%", height: "100%", background: "#000" }}
              />
            )}

            {/* Video scene support */}
            {currentSceneData?.videoUrl && (
              <div className="w-full h-full flex items-center justify-center bg-black">
                {renderVideoScene(currentSceneData.videoUrl)}
              </div>
            )}

            {/* Subtle hint */}
            {!isFullscreen && (
              <div className="absolute top-3 left-3 text-xs text-white/90 bg-black/30 rounded px-2 py-1">
                Drag to look • Scroll/Double‑click to zoom • Play to auto‑rotate
              </div>
            )}

            {/* Tour Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Button aria-label={isPlaying ? "Pause auto-rotate" : "Play auto-rotate"} variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button aria-label="Restart tour" variant="ghost" size="sm" onClick={resetTour} className="text-white hover:bg-white/20">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label="Previous scene"
                    variant="ghost"
                    size="sm"
                    onClick={prevScene}
                    disabled={currentScene === 0}
                    className="text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label="Next scene"
                    variant="ghost"
                    size="sm"
                    onClick={nextScene}
                    disabled={currentScene === scenes.length - 1}
                    className="text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    aria-label={narrationPlaying ? "Pause narration" : "Play narration"}
                    variant="ghost"
                    size="sm"
                    onClick={() => (narrationPlaying ? stopNarration() : playNarration())}
                    className="text-white hover:bg-white/20"
                  >
                    {narrationPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button aria-label="Zoom in" variant="ghost" size="sm" onClick={zoomIn} className="text-white hover:bg-white/20">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Zoom out" variant="ghost" size="sm" onClick={zoomOut} className="text-white hover:bg-white/20">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button aria-label={showHotspots ? "Hide hotspots" : "Show hotspots"} variant="ghost" size="sm" onClick={() => setShowHotspots((s) => !s)} className="text-white hover:bg-white/20">
                    <Info className={`h-4 w-4 ${showHotspots ? "text-white" : "text-white/60"}`} />
                  </Button>
                  <Button aria-label={gyroOn ? "Disable VR device orientation" : "Enable VR device orientation"} title="VR device orientation" variant="ghost" size="sm" onClick={toggleGyro} className="text-white hover:bg-white/20">
                    <Smartphone className={`h-4 w-4 ${gyroOn ? "text-green-400" : ""}`} />
                  </Button>
                  <Button aria-label="Enter fullscreen" variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={tourProgress} className="h-2" />
                <div className="flex justify-between text-xs text-white/80">
                  <span>{currentSceneData?.title}</span>
                  <span>{Math.round(tourProgress)}% complete</span>
                </div>
              </div>
              <div className="mt-2 text-right">
                <button
                  className="text-[11px] text-white/70 hover:text-white underline underline-offset-4"
                  onClick={() => setShowHelp((s) => !s)}
                >
                  {showHelp ? "Hide help" : "How to use"}
                </button>
              </div>
            </div>

            {showHelp && (
              <div className="absolute inset-x-4 bottom-28 md:bottom-24 bg-black/80 text-white rounded-lg p-4 text-xs space-y-2">
                <div className="font-medium text-sm">How to use the 360° tour</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Drag or swipe to look around</li>
                  <li>Use the +/– or double‑click to zoom</li>
                  <li>Tap Play for slow auto‑rotate; Pause to stop</li>
                  <li>Use device orientation (phone icon) on mobile</li>
                  <li>Enter fullscreen for the most immersive view</li>
                </ul>
              </div>
            )}
          </div>
          {/* Hidden audio element for audioUrl playback */}
          <audio ref={audioRef} onEnded={() => setNarrationPlaying(false)} className="hidden" />
        </CardContent>
      </Card>

      {/* Scene Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {scenes.map((scene, index) => (
              <button
                key={scene.id}
                onClick={() => handleSceneChange(index)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                  currentScene === index ? "border-primary" : "border-transparent hover:border-muted-foreground"
                }`}
              >
                <img
                  src={scene.image || "/placeholder.jpg"}
                  alt={scene.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (e.currentTarget.src.endsWith("/placeholder.jpg")) return
                    e.currentTarget.src = "/placeholder.jpg"
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                  <span className="text-white text-xs font-medium">{scene.title}</span>
                </div>
                {currentScene === index && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hotspot Information */}
      {currentSceneData?.hotspots && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Points of Interest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentSceneData.hotspots.map((hotspot, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground text-xs">{index + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{hotspot.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
