"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Crosshair, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Suggestion = { display_name: string; lat: string; lon: string }

function useDebounced<T>(value: T, delay = 300){
  const [v, setV] = useState(value)
  useEffect(()=>{ const t = setTimeout(()=> setV(value), delay); return ()=> clearTimeout(t) }, [value, delay])
  return v
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter your location",
  className,
  showGeolocate = true,
}:{
  value: string
  onChange: (v:string)=>void
  onSelect: (coords:{lat:number,lng:number}, label:string)=>void
  placeholder?: string
  className?: string
  showGeolocate?: boolean
}){
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Suggestion[]>([])
  const [locating, setLocating] = useState(false)
  const debounced = useDebounced(query, 300)
  const boxRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{ setQuery(value) },[value])

  useEffect(()=>{
    async function search(){
      if (!debounced || debounced.length < 3){ setItems([]); return }
      const url = new URL('https://nominatim.openstreetmap.org/search')
      url.searchParams.set('q', debounced)
      url.searchParams.set('format', 'json')
      url.searchParams.set('addressdetails','1')
      url.searchParams.set('limit','5')
      const r = await fetch(url.toString(), { headers: { 'Accept-Language': 'en' } })
      if (!r.ok) return
      const j: Suggestion[] = await r.json()
      setItems(j)
      setOpen(true)
    }
    search()
  },[debounced])

  useEffect(()=>{
    function onDoc(e: MouseEvent){
      if (!boxRef.current) return
      if (!boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return ()=> document.removeEventListener('mousedown', onDoc)
  },[])

  async function geolocate(){
    try {
      if (typeof window === 'undefined') return
      if (!window.isSecureContext) {
        toast.error("Location requires HTTPS or localhost")
        return
      }
      if (!('geolocation' in navigator)) {
        toast.error("Geolocation not supported in this browser")
        return
      }
      setLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos)=>{
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          onSelect(coords, 'Current location')
          onChange('Current location')
          setOpen(false)
          setLocating(false)
        },
        (err)=>{
          setLocating(false)
          const msg = err.code === 1
            ? 'Location permission denied'
            : err.code === 2
            ? 'Position unavailable'
            : 'Location request timed out'
          toast.error(msg)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    } catch (e:any) {
      setLocating(false)
      toast.error(e.message || 'Unable to get location')
    }
  }

  return (
    <div ref={boxRef} className={`relative ${className||''}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e)=> { setQuery(e.target.value); onChange(e.target.value) }}
            placeholder={placeholder}
            className="pl-10 rounded-2xl bg-white/95 border-amber-300 h-12 text-base"
            onFocus={()=> items.length>0 && setOpen(true)}
          />
        </div>
        {showGeolocate && (
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl h-12 text-base px-4"
            onClick={geolocate}
            disabled={locating}
          >
            {locating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin"/> Locating...
              </>
            ) : (
              <>
                <Crosshair className="h-4 w-4 mr-1"/> Use GPS
              </>
            )}
          </Button>
        )}
      </div>
      {open && items.length>0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-amber-200 bg-white shadow">
          {items.map((s, i)=> (
            <button
              key={`${s.lat}-${s.lon}-${i}`}
              type="button"
              className="block w-full text-left px-4 py-3 hover:bg-amber-50 text-sm"
              onClick={()=>{
                onSelect({ lat: Number(s.lat), lng: Number(s.lon) }, s.display_name)
                onChange(s.display_name)
                setOpen(false)
              }}
            >
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
