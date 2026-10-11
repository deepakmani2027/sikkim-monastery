"use client"
import styles from "./booking-cards.module.css"
import { useEffect, useMemo, useState } from "react"
import { monasteries } from "@/lib/monasteries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, IndianRupee, Star, BedDouble, Phone, ExternalLink, Utensils, Mountain, Footprints } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { withinKm, sortByDistance, haversineKm } from "@/lib/utils"
import type { Region } from "@/lib/regions"

export function BookingPanel(){
  const radiusKm = 5
  const hotelRadiusKm = 10
  const [monasteryId, setMonasteryId] = useState<string>(monasteries[0]?.id || "")
  const [dates, setDates] = useState<{in:string,out:string}>({ in: "", out: "" })
  const [guests, setGuests] = useState<number>(2)
  const query = useMemo(()=> new URLSearchParams({ monasteryId, checkIn: dates.in, checkOut: dates.out, guests: String(guests) }).toString(), [monasteryId, dates, guests])
  const m = useMemo(()=> monasteries.find(x=> x.id === monasteryId), [monasteryId])
  const [selected, setSelected] = useState<"hotel"|"tours"|"dining"|null>(null)
  const [sortBy, setSortBy] = useState<"google"|"rating"|"price"|"distance">("google")
  const [nearby, setNearby] = useState<{ hotel:any[]; tours:any[]; dining:any[] }>({ hotel: [], tours: [], dining: [] })
  const [poi, setPoi] = useState<{ hotel:any[]; homestay:any[]; restaurant:any[]; attraction:any[] }>({ hotel: [], homestay: [], restaurant: [], attraction: [] })
  const [loading, setLoading] = useState(false)
  const [placesHotels, setPlacesHotels] = useState<any[]>([])
  const [placesTours, setPlacesTours] = useState<any[]>([])
  const [placesDining, setPlacesDining] = useState<Array<{ id:string; name:string; location:{lat:number;lng:number}; rating?:number; priceLevel?:number; phone?:string; vicinity?: string; address?: string }>>([])
  const [resolvedPlaces, setResolvedPlaces] = useState<Record<string, { placeId?: string; address?: string }>>({})
  const [hotelDialogOpen, setHotelDialogOpen] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<any|null>(null)
  const [hotelAddOns, setHotelAddOns] = useState<{ cancellation: 'standard'|'free' }>({ cancellation: 'standard' })
  const [diningDialogOpen, setDiningDialogOpen] = useState(false)
  const [selectedDining, setSelectedDining] = useState<any|null>(null)
  const [diningReservation, setDiningReservation] = useState<{ date: string; time: string }>({ date: '', time: '' })
  const [toursDialogOpen, setToursDialogOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<any|null>(null)
  const [tourReservation, setTourReservation] = useState<{ date: string; time: string }>({ date: '', time: '' })

  function buildShortDescription(p: any, monasteryName?: string, amenities: string[] = [], isHotel = true) {
    const stars = Number(p?.tags?.stars)
    const rating = Number(p?.rating)
    const nameL = String(p?.name || '').toLowerCase()
    const locality = p?.locality || p?.tags?.['addr:place'] || p?.tags?.['addr:city']
    const dist = typeof p?.distanceKm === 'number' ? p.distanceKm : undefined

    // Tone
    let tone = 'Comfortable'
    if (!Number.isNaN(stars)) {
      if (stars >= 5) tone = 'Luxury'
      else if (stars >= 4) tone = 'Premium'
      else if (stars <= 2) tone = 'Cozy'
    }
    if (!Number.isNaN(rating) && rating >= 4.6) tone = `Top‑rated ${tone.toLowerCase()}`
    const heritage = (p?.tags?.heritage === 'yes') || /heritage|historic|palace/i.test(nameL)
    if (heritage) tone = `${tone} heritage`
    const boutique = /boutique|resort/i.test(nameL) || p?.tags?.resort === 'yes'
    if (boutique && !/heritage/.test(tone)) tone = `${tone} boutique`

    // Kind label
    const kind = isHotel ? (nameL.includes('resort') ? 'resort' : 'hotel') : (nameL.includes('guest house') ? 'guest house' : 'homestay')

    // Amenities prioritization
    const prioritized = [
      'Mountain View',
      'Spa',
      'Restaurant',
      'WiFi',
    ]
    const present = prioritized.filter(a => amenities.includes(a))
    const scenic = present.includes('Mountain View')
    const others = present.filter(a => a !== 'Mountain View')

    // Location phrase
    let locPhrase = `near ${monasteryName || 'the monastery'}`
    if (typeof dist === 'number' && dist > 0.2) {
      locPhrase = `${dist.toFixed(2)} km from ${monasteryName || 'the monastery'}`
    }
    if (locality && !nameL.includes(String(locality).toLowerCase())) {
      locPhrase = `${locPhrase} · ${locality}`
    }

    // Amenity clause
    let clause = ''
    if (scenic) clause = ' with Himalayan views'
    else if (others.length) clause = ` with ${others.slice(0,2).join(', ')}`

    return `${tone} ${kind} ${locPhrase}${clause}.`
  }

  // Curated description pools
  const HOMESTAY_LINES = [
    'Gives cozy rooms with warm Sikkimese hospitality.',
    'Provides an authentic tribal experience with local cuisine.',
    'A family run stay with breathtaking views.',
    'Offers rustic charm with modern comforts.',
    'A calm retreat in a village setting.',
    'Serves organic food with traditional hospitality.',
    'Ideal choice for meditation and nature lovers.',
    'Lets guests experience old Sikkimese architecture and culture.',
    'Surrounded by forests and organic farms.',
    'Allows visitors to engage in farming and local traditions.',
  ]
  const HOTEL_LINES = [
    'Provides modern comfort with panoramic mountain views.',
    'Offers an elegant stay close to city markets.',
    'Ensures a luxury stay overlooking snowy peaks.',
    'Serves as a comfortable base near monasteries.',
    'Delights guests with rooftop dining and scenic landscapes.',
    'A budget friendly stay surrounded by greenery.',
    'Combines premium amenities with traditional décor.',
    'A boutique option with peaceful ambiance.',
    'Offers a central location with easy transport access.',
    'Carries a spiritual vibe with proximity to monasteries.',
  ]

  function stablePick(arr: string[], key: string) {
    if (!arr.length) return ''
    let h = 0
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
    return arr[h % arr.length]
  }

  // Deterministic jitter for price variance per item
  function stableHash(key: string): number {
    let h = 2166136261 >>> 0
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }
  function stableJitter(key: string, min = 0.88, max = 1.22): number {
    const h = stableHash(key)
    const t = (h % 10000) / 10000 // 0..1
    return min + t * (max - min)
  }

  function estimatePriceFromLevel(level?: string | number, fallback = 1200): number {
    if (typeof level === "string") {
      if (level === "PRICE_LEVEL_VERY_EXPENSIVE") return 3500
      if (level === "PRICE_LEVEL_EXPENSIVE") return 2200
      if (level === "PRICE_LEVEL_MODERATE") return 1400
      if (level === "PRICE_LEVEL_INEXPENSIVE") return 900
      return fallback
    }
    if (typeof level === "number") return [300, 500, 800, 1200, 1800][Math.max(0, Math.min(4, level))] || fallback
    return fallback
  }

  function sortListings<T extends { rating?: number; priceINR?: number; distanceKm?: number }>(items: T[]): T[] {
    if (sortBy === "google") return items
    return [...items].sort((a, b) => {
      if (sortBy === "rating") return (Number(b.rating) || 0) - (Number(a.rating) || 0) || (Number(a.distanceKm) || Infinity) - (Number(b.distanceKm) || Infinity)
      if (sortBy === "price") return (Number(a.priceINR) || Infinity) - (Number(b.priceINR) || Infinity) || (Number(a.distanceKm) || Infinity) - (Number(b.distanceKm) || Infinity)
      return (Number(a.distanceKm) || Infinity) - (Number(b.distanceKm) || Infinity) || (Number(b.rating) || 0) - (Number(a.rating) || 0)
    })
  }

  async function verifyPayment(requestId: string, response: any): Promise<boolean> {
    try {
      const confirmation = await fetch('/api/services/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_payment',
          requestId,
          payment: {
            razorpay_payment_id: response?.razorpay_payment_id,
            razorpay_order_id: response?.razorpay_order_id,
            razorpay_signature: response?.razorpay_signature,
          },
        }),
      })
      const confirmationBody = await confirmation.json()
      if (!confirmation.ok || !confirmationBody.confirmed) {
        toast.error(confirmationBody.error || 'Payment verification failed')
        return false
      }
      return true
    } catch (error) {
      console.error('Payment verification request failed', error)
      toast.error('Payment verification failed')
      return false
    }
  }

  useEffect(()=>{
    let cancelled = false
    async function load(){
      if (!m) return
      setLoading(true)
      try {
  const r1 = await fetch(`/api/services/nearby?near=${m.coordinates.lat},${m.coordinates.lng}&radiusKm=${radiusKm}`)
        const j1 = await r1.json()
        if (!cancelled && r1.ok) setNearby({ hotel: j1.hotel||[], tours: j1.tours||[], dining: j1.dining||[] })

        // Real hotels/homestays from Planner's POI endpoint by region
        const district = m.district || ""
        const region: Region | null = district.includes("East") ? "East Sikkim" :
          district.includes("West") ? "West Sikkim" :
          district.includes("North") ? "North Sikkim" :
          district.includes("South") ? "South Sikkim" : null
        if (region) {
          const r2 = await fetch(`/api/poi?region=${encodeURIComponent(region)}`, { cache: "no-store" })
          if (r2.ok) {
            const j2 = await r2.json()
            if (!cancelled) setPoi({ hotel: j2.hotel || [], homestay: j2.homestay || [], restaurant: j2.restaurant || [], attraction: j2.attraction || [] })
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return ()=>{ cancelled = true }
  },[m])

  // Load real Google lodging and tourist-attraction listings for this monastery.
  useEffect(()=>{
    let cancelled = false
    async function loadGoogleListings(){
      if (!m) return
      const near = `${m.coordinates.lat},${m.coordinates.lng}`
      const radius = radiusKm * 1000
      try {
        const hotelResponse = await fetch(
          `/api/services/places?near=${near}&radius=${hotelRadiusKm * 1000}&type=lodging&text=${encodeURIComponent(`hotels near ${m.name} ${m.location}`)}`,
        )
        const hotelResults = hotelResponse.ok ? (await hotelResponse.json()).results || [] : []
        const tourResponse = await fetch(
          `/api/services/places?near=${near}&radius=${radius}&type=tourist_attraction&text=${encodeURIComponent(`tourist attractions, sightseeing, activities near ${m.name} ${m.location}`)}`,
        )
        const tourResults = tourResponse.ok ? (await tourResponse.json()).results || [] : []
        if (cancelled) return
        setPlacesHotels(hotelResults)
        setPlacesTours(tourResults)
      } catch {
        if (!cancelled) {
          setPlacesHotels([])
          setPlacesTours([])
        }
      }
    }
    loadGoogleListings()
    return ()=>{ cancelled = true }
  }, [m, radiusKm, hotelRadiusKm])

  // Reset resolvedPlaces when monastery changes
  useEffect(()=>{
    setResolvedPlaces({})
  }, [m])

  // Fetch real restaurant info (rating/price level/phone) via Places proxy
  useEffect(()=>{
    let cancelled = false
    async function loadPlaces(){
      if (!m) return
      try {
        const r = await fetch(`/api/services/places?near=${m.coordinates.lat},${m.coordinates.lng}&radius=${radiusKm*1000}&type=restaurant&text=${encodeURIComponent(`restaurants near ${m.name} ${m.location}`)}`)
        if (!r.ok) return
        const j = await r.json()
        if (!cancelled) setPlacesDining(j.results || [])
      } catch {
        /* ignore */
      }
    }
    loadPlaces()
    return ()=>{ cancelled = true }
  }, [m, radiusKm])

  const accommodation = useMemo(()=>{
    if (!m) return [] as any[]
    const googleItems = placesHotels
      .filter((item: any) => item?.location && item?.name)
      .map((item: any) => ({
        ...item,
        id: `google-hotel-${item.id}`,
        placeId: item.id,
        distanceKm: Number(haversineKm(m.coordinates, item.location).toFixed(2)),
        coordinates: item.location,
        priceINR: item.priceLevel === "PRICE_LEVEL_VERY_EXPENSIVE"
          ? 6000
          : item.priceLevel === "PRICE_LEVEL_EXPENSIVE"
            ? 3500
            : item.priceLevel === "PRICE_LEVEL_MODERATE"
              ? 2200
              : 1200,
        tags: { tourism: "hotel", source: "Google Maps" },
        address: item.address || item.vicinity,
        phone: item.phone || "",
        website: item.website || "",
        userRatingsTotal: item.userRatingsTotal || 0,
        openingHours: item.openingHours || [],
        source: "Google Places",
      }))
      .filter((item: any) => item.distanceKm <= hotelRadiusKm)
    return googleItems
  }, [placesHotels, m, hotelRadiusKm])

  const enrichedAccommodation = useMemo(()=>{
    return accommodation.map((p: any) => {
      const kind = p.primaryType
        ? p.primaryType.replace(/_/g, " ")
        : "Accommodation"
      return {
        ...p,
        kind,
        amenities: [],
        locality: p.address || p.vicinity || "",
      }
    })
  }, [accommodation])

  // Dining (restaurants) within radius
  const eateries = useMemo(()=>{
    if (!m) return [] as any[]
    const within = withinKm(m.coordinates, poi.restaurant || [], radiusKm)
    const sorted = sortByDistance(m.coordinates, within)
    const named = sorted.filter((p:any) => {
      const nm = String(p?.name || '').trim()
      return nm.length > 0 && !/^unnamed$/i.test(nm)
    })
    return named.map((p:any)=> ({
      id: p.id,
      name: p.name,
      distanceKm: Number(haversineKm(m.coordinates, p.coordinates).toFixed(2)),
      coordinates: p.coordinates,
      tags: p.tags || {},
    }))
  }, [poi, m, radiusKm])

  const DINING_LINES = [
    'Authentic Tibetan cuisine in traditional setting.',
    'Cozy eatery serving local Sikkimese dishes.',
    'Family-run kitchen with homely flavors.',
    'Fresh organic produce with regional recipes.',
    'Street-style snacks and heartwarming meals.',
    'Scenic spot known for momos and thukpa.',
  ]
  const SIKKIM_HINTS = [
    'sikkim','gangtok','namchi','gyalshing','geyzing','mangan','pakyong','soreng',
    'ravangla','rabongla','rumtek','tashiding','pelling','yuksom','lachung','lachen',
    'rinchenpong','rangpo','dentam','namthang','rhenock','nayabazar'
  ]
  function placeLooksInSikkim(pl: any){
    const txt = `${pl?.address||''} ${pl?.vicinity||''}`.toLowerCase()
    if (!txt) return true // if unknown, don't over-filter
    return SIKKIM_HINTS.some(h=> txt.includes(h))
  }

  // Tours & Activities (from OSM attractions) within radius
  const attractions = useMemo(()=>{
    if (!m) return [] as any[]
    const googleItems = placesTours
      .filter((item: any) => item?.location && item?.name)
      .map((item: any) => ({
        ...item,
        id: `google-tour-${item.id}`,
        placeId: item.id,
        distanceKm: Number(haversineKm(m.coordinates, item.location).toFixed(2)),
        coordinates: item.location,
        tags: { tourism: "attraction", source: "Google Maps" },
        address: item.address || item.vicinity,
      }))
      .filter((item: any) => item.distanceKm <= radiusKm)
    return googleItems
  }, [placesTours, m, radiusKm])

  const TOURS_LINES = [
    'Guided heritage walk with local stories.',
    'Photography-friendly viewpoints and scenic stops.',
    'Short trek with monastery insights.',
    'Cultural experience with crafts and cuisine.',
    'Nature trail with bird-watching highlights.',
  ]

  const enrichedTours = useMemo(()=>{
    return attractions.map((p:any)=>{
      return {
        ...p,
        priceINR: estimatePriceFromLevel(p.priceLevel, 900),
        category: p.primaryType ? p.primaryType.replace(/_/g, " ") : "",
        source: "Google Places",
      }
    })
  }, [attractions])

  const enrichedDining = useMemo(()=>{
    return placesDining
      .filter((place: any) => place?.location && place?.name)
      .map((place: any) => ({
        ...place,
        id: `google-dining-${place.id}`,
        placeId: place.id,
        coordinates: place.location,
        distanceKm: Number(haversineKm(m!.coordinates, place.location).toFixed(2)),
        priceINR: estimatePriceFromLevel(place.priceLevel, 800),
        address: place.address || place.vicinity,
        phone: place.phone || "",
        rating: place.rating ? Number(Number(place.rating).toFixed(1)) : undefined,
        userRatingsTotal: place.userRatingsTotal || 0,
        desc: place.primaryType ? place.primaryType.replace(/_/g, " ") : "Google Places restaurant",
        source: "Google Places",
      }))
      .filter((place: any) => place.distanceKm <= radiusKm)
  }, [placesDining, m, radiusKm])

  // Background-resolve missing placeIds via Text Search so Map opens exact pages for all cards
  useEffect(()=>{
    let cancelled = false
    async function resolveAll(){
      if (!m) return
      const missing = enrichedDining.filter((d:any)=> !d.placeId).slice(0, 12)
      if (!missing.length) return
      await Promise.all(missing.map(async (d:any)=>{
        try {
          const lat = d.coordinates?.lat ?? d.coordinates?.latitude
          const lng = d.coordinates?.lng ?? d.coordinates?.longitude
          const hint = (d.address || d.locality || 'Sikkim') as string
          const query = [d.name as string, hint].filter(Boolean).join(' ').trim()
          // Try Find Place first
          let items: any[] = []
          let r = await fetch(`/api/services/places?find=${encodeURIComponent(query)}${(typeof lat==='number'&&typeof lng==='number')?`&near=${lat},${lng}&radius=${radiusKm*1000}`:''}&type=restaurant`)
          if (r.ok) {
            const jf = await r.json()
            items = (jf.results||[])
          }
          if (!items.length) {
            // Fallback to Text Search
            r = await fetch(`/api/services/places?text=${encodeURIComponent(query)}${(typeof lat==='number'&&typeof lng==='number')?`&near=${lat},${lng}&radius=${radiusKm*1000}`:''}&type=restaurant`)
            if (!r.ok) return
            const j = await r.json()
            items = (j.results||[]) as Array<any>
          }
          if (!items.length) return
          let best = items[0]
          let bestDist = Infinity
          if (typeof lat === 'number' && typeof lng === 'number') {
            for (const it of items) {
              const dk = haversineKm({ lat, lng }, it.location)
              if (dk < bestDist) { bestDist = dk; best = it }
            }
          }
          if (!cancelled) {
            setResolvedPlaces(prev => prev[d.id]?.placeId ? prev : { ...prev, [d.id]: { placeId: best.id, address: best.address } })
          }
        } catch {}
      }))
    }
    resolveAll()
    return ()=>{ cancelled = true }
  }, [enrichedDining, m, radiusKm])

  const formatINR = (n: number) => new Intl.NumberFormat('en-IN').format(Math.round(n))
  const safeDate = (s?: string) => (s && !Number.isNaN(Date.parse(s))) ? new Date(s) : null
  function calcNights(checkIn?: string, checkOut?: string): number {
    const d1 = safeDate(checkIn)
    const d2 = safeDate(checkOut)
    if (!d1 || !d2) return 1
    const ms = d2.getTime() - d1.getTime()
    const nights = Math.max(1, Math.round(ms / (1000*60*60*24)))
    return nights
  }

  function LoadingList({ label }: { label: string }){
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-primary">
          <div className="h-4 w-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" aria-hidden />
          <span className="font-semibold">Searching available {label} options near {m?.name}…</span>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-1 grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 bg-gradient-to-r from-[#6a2b2b] via-[#6f2d2d] to-[#5a2424] text-white shadow-sm border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-white/10" />
                  <div className="space-y-2 w-56">
                    <div className="h-5 bg-white/30 rounded w-40" />
                    <div className="h-4 bg-white/20 rounded w-52" />
                    <div className="h-3 bg-white/20 rounded w-48" />
                  </div>
                </div>
                <div className="flex-1" />
                <div className="space-y-2 min-w-[180px] w-48">
                  <div className="h-4 bg-white/30 rounded w-24 ml-auto" />
                  <div className="h-8 bg-white/20 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section>
      <Card className="rounded-[28px] border border-amber-200/60 bg-amber-50/80 shadow-sm ring-1 ring-amber-100">
        <CardHeader className="pb-0">
          <div className="-mx-6 -mt-6 rounded-t-[28px] bg-gradient-to-r from-amber-200 via-orange-300 to-amber-600 px-6 py-5">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-primary">Booking & Reservations</CardTitle>
            <p className="text-base mt-1 text-foreground">Select dates, guests and monastery to see nearby options (hotels ≤ 10 km).</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="text-primary font-semibold text-lg">Trip Filters</div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-3">
              <Label className="text-primary font-semibold mb-2 block">Check-in</Label>
              <Input type="date" value={dates.in} onChange={(e)=> setDates(p=> ({ ...p, in: e.target.value }))} className="h-12 rounded-2xl bg-white/95 border-amber-300 text-base" />
            </div>
            <div className="md:col-span-3">
              <Label className="text-primary font-semibold mb-2 block">Check-out</Label>
              <Input type="date" value={dates.out} onChange={(e)=> setDates(p=> ({ ...p, out: e.target.value }))} className="h-12 rounded-2xl bg-white/95 border-amber-300 text-base" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-primary font-semibold mb-2 block">Guests</Label>
              <Input type="number" min={1} value={guests} onChange={(e)=> setGuests(Number(e.target.value || 1))} className="h-12 rounded-2xl bg-white/95 border-amber-300 text-base" />
            </div>
            <div className="md:col-span-4">
              <Label className="text-primary font-semibold mb-2 block">Monastery</Label>
              <Select value={monasteryId} onValueChange={setMonasteryId}>
                <SelectTrigger className="bg-white/90 border-amber-300 rounded-2xl h-12 focus:ring-primary/30"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {monasteries.map((m)=> <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <button
              type="button"
              aria-pressed={selected==='hotel'}
              onClick={()=> setSelected('hotel')}
              className={`${styles.selectCard} ${selected==='hotel' ? styles.selectActive : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className={styles.selectIcon}><BedDouble className="w-5 h-5"/></span>
                <div>
                  <div className="text-lg font-semibold text-primary">Hotels & Accommodation</div>
                  <div className="text-sm text-muted-foreground mt-1">See hotels near your selected monastery with price and rating.</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              aria-pressed={selected==='tours'}
              onClick={()=> setSelected('tours')}
              className={`${styles.selectCard} ${selected==='tours' ? styles.selectActive : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className={styles.selectIcon}><Footprints className="w-5 h-5"/></span>
                <div>
                  <div className="text-lg font-semibold text-primary">Tours & Activities</div>
                  <div className="text-sm text-muted-foreground mt-1">Curated monastery heritage tours and local experiences.</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              aria-pressed={selected==='dining'}
              onClick={()=> setSelected('dining')}
              className={`${styles.selectCard} ${selected==='dining' ? styles.selectActive : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className={styles.selectIcon}><Utensils className="w-5 h-5"/></span>
                <div>
                  <div className="text-lg font-semibold text-primary">Local Dining</div>
                  <div className="text-sm text-muted-foreground mt-1">Nearby cafes and restaurants within 5 km.</div>
                </div>
              </div>
            </button>
          </div>

          {selected && (
            <div className="mt-2 rounded-2xl border border-amber-300 bg-amber-50/60">
              <div className="px-4 py-3 border-b border-amber-200/70 rounded-t-2xl bg-white/60">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-primary">
                    {selected === 'hotel' ? 'Hotels & Accommodation' : selected === 'tours' ? 'Tours & Activities' : 'Local Dining'} near {m?.name} (≤ {selected === 'hotel' ? hotelRadiusKm : radiusKm} km)
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="booking-sort" className="text-sm text-primary">Sort by</Label>
                    <Select value={sortBy} onValueChange={(value)=> setSortBy(value as "google"|"rating"|"price"|"distance")}>
                      <SelectTrigger id="booking-sort" className="h-9 w-[150px] rounded-xl border-amber-300 bg-white/90">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google ranking</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                      </SelectContent>
                    </Select>
                    {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
                  </div>
                </div>
              </div>
              <div className="p-4 grid gap-4">
                {selected === 'hotel' ? (
                  <>
                    {loading ? (
                      <LoadingList label="Hotels & Accommodation" />
                    ) : enrichedAccommodation.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No hotels or hostels found within {hotelRadiusKm} km.</div>
                    ) : sortListings(enrichedAccommodation).map((x:any)=> (
                      <div key={x.id} className={`${styles.amberCard}`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-orange-400 to-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                              <BedDouble className="w-10 h-10 text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-amber-900">{x.name}</div>
                              <div className="mt-1 text-amber-900/80 inline-flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {x.address ? (
                                  <span>{x.address}</span>
                                ) : x.locality ? (
                                  <span>{x.locality}</span>
                                ) : (
                                  <span>Near {m?.name}</span>
                                )}
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-amber-900/75">
                                <span>{Number(x.distanceKm || 0).toFixed(2)} km from {m?.name}</span>
                                <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 text-amber-600" />{x.rating ? x.rating : "No rating"}</span>
                              </div>
                              {x.desc ? <div className="mt-2 text-amber-900/70">{x.desc}</div> : null}
                              {x.userRatingsTotal ? (
                                <div className="mt-1 text-sm text-amber-900/70">
                                  {Number(x.userRatingsTotal).toLocaleString("en-IN")} Google reviews
                                </div>
                              ) : null}
                              {x.website ? (
                                <a
                                  href={x.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-1 inline-block text-sm text-blue-700 underline"
                                >
                                  Official website
                                </a>
                              ) : null}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className={styles.amberChip}>{x.kind || 'Hotel'}</span>
                                {x.amenities?.slice(0,4).map((t:string, idx:number)=> (
                                  <span key={idx} className={styles.amberChip}>{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex-1" />

                          <div className="flex flex-col items-end gap-2 min-w-[180px]">
                            <div className="inline-flex items-center gap-2">
                              {x.rating ? <span className="inline-flex items-center gap-1 text-sm text-amber-800"><Star className="w-4 h-4" />{x.rating}</span> : null}
                              {x.businessStatus ? <span className="text-xs px-2 py-1 rounded-full bg-emerald-600/90 text-white">{String(x.businessStatus).replace("_", " ")}</span> : null}
                            </div>
                            {x.priceINR ? (
                              <div className="text-amber-900 text-xl font-extrabold">
                                ₹{formatINR(x.priceINR)}<span className="pl-1 text-amber-800 text-sm font-medium">/night</span>
                              </div>
                            ) : x.priceLevel ? (
                              <div className="text-amber-900 text-sm font-semibold">{String(x.priceLevel).replace("PRICE_LEVEL_", "Google price ")}</div>
                            ) : null}
                            <div className="flex items-center gap-2 pt-1">
                              {x.phone && (
                                <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={()=> window.open(`tel:${x.phone}`,'_self')}>
                                  <Phone className="w-4 h-4 mr-2"/> Call
                                </Button>
                              )}
                              <Button className="rounded-full bg-amber-600 hover:bg-amber-700 text-white" onClick={async()=>{
                                const lat = x.coordinates?.lat ?? x.coordinates?.latitude
                                const lng = x.coordinates?.lng ?? x.coordinates?.longitude
                                if (x.placeId) {
                                  const url = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(x.placeId)}`
                                  window.open(url, '_blank')
                                  return
                                }
                                if (x.name) {
                                  try {
                                    const hint = (x.address || x.locality || 'Sikkim') as string
                                    const query = [x.name as string, hint].filter(Boolean).join(' ').trim()
                                    // Try Find Place first (lodging)
                                    const fp = await fetch(`/api/services/places?find=${encodeURIComponent(query)}${(typeof lat==='number'&&typeof lng==='number')?`&near=${lat},${lng}&radius=${radiusKm*1000}`:''}&type=lodging`)
                                    if (fp.ok) {
                                      const jf = await fp.json()
                                      const best = (jf.results||[])[0]
                                      if (best?.id) {
                                        const url = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(best.id)}`
                                        window.open(url, '_blank')
                                        return
                                      }
                                    }
                                    // Fallback to Text Search
                                    const ts = await fetch(`/api/services/places?text=${encodeURIComponent(query)}${(typeof lat==='number'&&typeof lng==='number')?`&near=${lat},${lng}&radius=${radiusKm*1000}`:''}&type=lodging`)
                                    if (ts.ok) {
                                      const j = await ts.json()
                                      const match = (j.results||[])[0]
                                      if (match?.id) {
                                        const url = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(match.id)}`
                                        window.open(url, '_blank')
                                        return
                                      }
                                    }
                                  } catch {}
                                  const namePart = x.name as string
                                  const hint2 = (x.address || x.locality || '') as string
                                  let qName = [namePart, hint2].filter(Boolean).join(' ').trim()
                                  if (!/\bsikkim\b/i.test(qName)) qName = `${qName} Sikkim`.trim()
                                  const q = (typeof lat === 'number' && typeof lng === 'number') ? `${qName} near ${lat},${lng}` : qName
                                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
                                  window.open(url, '_blank')
                                  return
                                }
                                if (typeof lat === 'number' && typeof lng === 'number') {
                                  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
                                  window.open(url, '_blank')
                                  return
                                }
                                toast.error('Location not available')
                              }}>
                                <MapPin className="w-4 h-4 mr-2"/>Map
                              </Button>
                              <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600" onClick={()=>{ setSelectedHotel(x); setHotelDialogOpen(true) }}>
                                <ExternalLink className="w-4 h-4 mr-2"/> Book Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : selected === 'dining' ? (
                  <>
                    {loading ? (
                      <LoadingList label="Local Dining" />
                    ) : enrichedDining.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No restaurants found within 5 km.</div>
                    ) : sortListings(enrichedDining).map((x:any)=> (
                      <div key={x.id} className={`${styles.amberCard}`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-orange-400 to-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                              <Utensils className="w-10 h-10 text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-amber-900">{x.name}</div>
                              <div className="mt-1 text-amber-900/80 inline-flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {x.address ? (<span>{x.address}</span>) : (<span>Near {m?.name}</span>)}
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-amber-900/75">
                                <span>{Number(x.distanceKm || 0).toFixed(2)} km from {m?.name}</span>
                                <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 text-amber-600" />{x.rating ? x.rating : "No rating"}</span>
                              </div>
                              <div className="mt-2 text-amber-900/70">{x.desc}</div>
                              {x.cuisine && (
                                <div className="mt-2 text-amber-900/80 inline-flex items-center gap-2"><span className="text-amber-700">🍽️</span> Cuisine: {x.cuisine}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1" />

                          <div className="flex flex-col items-end gap-2 min-w-[180px]">
                            <div className="inline-flex items-center gap-2">
                              {x.rating ? <span className="inline-flex items-center gap-1 text-sm text-amber-800"><Star className="w-4 h-4" />{x.rating}</span> : null}
                              {x.businessStatus ? <span className="text-xs px-2 py-1 rounded-full bg-emerald-600/90 text-white">{String(x.businessStatus).replace("_", " ")}</span> : null}
                            </div>
                            <div className="text-amber-900 text-xl font-extrabold">
                              ₹{formatINR(x.priceINR)}<span className="pl-1 text-amber-800 text-sm font-medium">/person</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              {x.phone && (
                                <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={()=> window.open(`tel:${x.phone}`,'_self')}>
                                  <Phone className="w-4 h-4 mr-2"/> Call
                                </Button>
                              )}
                              <Button className="rounded-full bg-amber-600 hover:bg-amber-700 text-white" onClick={async()=>{
                                const lat = x.coordinates?.lat ?? x.coordinates?.latitude
                                const lng = x.coordinates?.lng ?? x.coordinates?.longitude
                                if (x.placeId) {
                                  const url = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(x.placeId)}`
                                  window.open(url, '_blank')
                                  return
                                }
                                if (x.name) {
                                  try {
                                    const hint = (x.address || x.locality || 'Sikkim') as string
                                    const query = [x.name as string, hint].filter(Boolean).join(' ').trim()
                                    // Try Find Place first
                                    const fp = await fetch(`/api/services/places?find=${encodeURIComponent(query)}${(typeof lat==='number'&&typeof lng==='number')?`&near=${lat},${lng}&radius=${radiusKm*1000}`:''}&type=restaurant`)
                                    if (fp.ok) {
                                      const jf = await fp.json()
                                      const best = (jf.results||[])[0]
                                      if (best?.id) {
                                        const url = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(best.id)}`
                                        window.open(url, '_blank')
                                        return
                                      }
                                    }
                                    // Fallback to Text Search
                                    const ts = await fetch(`/api/services/places?text=${encodeURIComponent(query)}${(typeof lat==='number'&&typeof lng==='number')?`&near=${lat},${lng}&radius=${radiusKm*1000}`:''}&type=restaurant`)
                                    if (ts.ok) {
                                      const j = await ts.json()
                                      const match = (j.results||[])[0]
                                      if (match?.id) {
                                        const url = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(match.id)}`
                                        window.open(url, '_blank')
                                        return
                                      }
                                    }
                                  } catch {}
                                  const namePart = x.name as string
                                  const hint2 = (x.address || x.locality || '') as string
                                  let qName = [namePart, hint2].filter(Boolean).join(' ').trim()
                                  if (!/\bsikkim\b/i.test(qName)) qName = `${qName} Sikkim`.trim()
                                  const q = (typeof lat === 'number' && typeof lng === 'number') ? `${qName} near ${lat},${lng}` : qName
                                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
                                  window.open(url, '_blank')
                                  return
                                }
                                if (typeof lat === 'number' && typeof lng === 'number') {
                                  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
                                  window.open(url, '_blank')
                                  return
                                }
                                toast.error('Location not available')
                              }}>
                                <MapPin className="w-4 h-4 mr-2"/>Map
                              </Button>
                              <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600" onClick={()=>{ setSelectedDining(x); setDiningDialogOpen(true) }}>
                                <ExternalLink className="w-4 h-4 mr-2"/> Book Table
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : selected === 'tours' ? (
                  <>
                    {loading ? (
                      <LoadingList label="Tours & Activities" />
                    ) : enrichedTours.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No tours found within 5 km.</div>
                    ) : sortListings(enrichedTours).map((x:any)=> (
                      <div key={x.id} className={`${styles.amberCard}`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-orange-400 to-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                              <MapPin className="w-10 h-10 text-white" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-amber-900">{x.name}</div>
                              <div className="mt-1 text-amber-900/80 inline-flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {typeof x.distanceKm === 'number' && (
                                  <span className="opacity-90">• {Number(x.distanceKm).toFixed(2)} km from {m?.name}</span>
                                )}
                              </div>
                              {x.desc ? <div className="mt-2 text-amber-900/70">{x.desc}</div> : null}
                              {x.category ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className={styles.amberChip}>{x.category}</span>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex-1" />

                          <div className="flex flex-col items-end gap-2 min-w-[180px]">
                            <div className="inline-flex items-center gap-2">
                              {x.rating ? <span className="inline-flex items-center gap-1 text-sm text-amber-800"><Star className="w-4 h-4" />{x.rating}</span> : null}
                              {x.businessStatus ? <span className="text-xs px-2 py-1 rounded-full bg-emerald-600/90 text-white">{String(x.businessStatus).replace("_", " ")}</span> : null}
                            </div>
                            {x.priceINR ? (
                              <div className="text-amber-900 text-xl font-extrabold">
                                ₹{formatINR(x.priceINR)}<span className="pl-1 text-amber-800 text-sm font-medium">/person</span>
                              </div>
                            ) : null}
                            <div className="flex items-center gap-2 pt-1">
                              <Button className="rounded-full bg-amber-600 hover:bg-amber-700 text-white" onClick={()=>{
                                const url = x.placeId
                                  ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(x.placeId)}`
                                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${x.name} ${x.address || m?.name || ""}`)}`
                                window.open(url, '_blank', 'noopener,noreferrer')
                              }}>
                                <MapPin className="w-4 h-4 mr-2"/>Map
                              </Button>
                              <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600" onClick={()=>{ setSelectedTour(x); setToursDialogOpen(true) }}>
                                <ExternalLink className="w-4 h-4 mr-2"/> Book Experience
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Hotel Booking Dialog */}
      <Dialog open={hotelDialogOpen} onOpenChange={(o)=>{ setHotelDialogOpen(o); if (!o) setSelectedHotel(null) }}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-primary">Confirm Hotel Booking</DialogTitle>
            <DialogDescription>Review your stay details and bill before submitting.</DialogDescription>
          </DialogHeader>
          {selectedHotel && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 bg-gradient-to-r from-[#6a2b2b] via-[#6f2d2d] to-[#5a2424] text-white border border-white/10">
                <div className="text-lg font-semibold">{selectedHotel.name}</div>
                <div className="text-amber-100/90 mt-1 inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {selectedHotel.address ? selectedHotel.address : (selectedHotel.locality ? selectedHotel.locality : `Near ${m?.name}`)}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Check-in</div>
                  <div className="font-semibold">{dates.in || 'Not set'}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Check-out</div>
                  <div className="font-semibold">{dates.out || 'Not set'}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Nights</div>
                  <div className="font-semibold">{calcNights(dates.in, dates.out)}</div>
                </div>
              </div>
              {/* Options */}
              <div className="rounded-xl border p-4">
                <div className="text-primary font-semibold mb-2">Options</div>
                <RadioGroup value={hotelAddOns.cancellation} onValueChange={(v)=> setHotelAddOns({ cancellation: v as any })}>
                  <label className="flex items-center gap-3">
                    <RadioGroupItem id="cancel-standard" value="standard" />
                    <span className="text-sm">Standard cancellation (no extra cost)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <RadioGroupItem id="cancel-free" value="free" />
                    <span className="text-sm">Free cancellation (+₹200)</span>
                  </label>
                </RadioGroup>
              </div>

              {/* Bill */}
              {selectedHotel.priceINR ? (() => {
                const nights = calcNights(dates.in, dates.out)
                const perNight = Number(selectedHotel.priceINR || 0)
                const subtotal = perNight * nights
                const gstRate = perNight >= 7500 ? 0.18 : perNight >= 1000 ? 0.12 : 0
                const gstPct = Math.round(gstRate*100)
                const gstAmt = Math.round(subtotal * gstRate)
                const addOn = hotelAddOns.cancellation === 'free' ? 200 : 0
                const total = subtotal + gstAmt + addOn
                return (
                  <div className="rounded-xl border p-4">
                    <div className="text-primary font-semibold mb-2">Hotel Rent Slip</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between"><span>Room charge</span><span>₹{formatINR(perNight)} / night</span></div>
                      <div className="flex items-center justify-between"><span>Nights</span><span>{nights}</span></div>
                      <div className="flex items-center justify-between font-medium"><span>Subtotal</span><span>₹{formatINR(subtotal)}</span></div>
                      {addOn > 0 && <div className="flex items-center justify-between"><span>Free cancellation</span><span>+₹{formatINR(addOn)}</span></div>}
                      <div className="flex items-center justify-between"><span>GST ({gstPct}%)</span><span>₹{formatINR(gstAmt)}</span></div>
                      <div className="h-px bg-border my-2" />
                      <div className="flex items-center justify-between text-lg font-extrabold"><span>Total</span><span>₹{formatINR(total)}</span></div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Rent slip total includes the selected room estimate, nights, cancellation option, and applicable GST.</div>
                  </div>
                )
              })() : (
                <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                  Google Places does not provide a verified room price for this property. Use the official website or Google Maps listing for current availability and pricing.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              disabled={!dates.in || !dates.out || calcNights(dates.in, dates.out) < 1}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
              onClick={async()=>{
                if (!selectedHotel) return
                const nights = calcNights(dates.in, dates.out)
                const perNight = Number(selectedHotel.priceINR || 0)
                const subtotal = perNight * nights
                const gstRate = perNight >= 7500 ? 0.18 : perNight >= 1000 ? 0.12 : 0
                const gstAmt = Math.round(subtotal * gstRate)
                const addOn = hotelAddOns.cancellation === 'free' ? 200 : 0
                const total = subtotal + gstAmt + addOn
                const payload = { type: 'hotel', item: selectedHotel, monasteryId, dates, nights, options: { cancellation: hotelAddOns.cancellation, addOn }, bill: { perNight, subtotal, gstRate, gstAmt, addOn, total } }
                const r = await fetch('/api/services/requests', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                const j = await r.json()
                if (!r.ok) { toast.error(j.error || 'Failed'); return }

                // If server returned a Razorpay order, open checkout
                if (j?.order && j?.key_id) {
                  try {
                    // load script if needed
                    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
                      await new Promise<void>((resolve, reject) => {
                        const s = document.createElement('script')
                        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
                        s.onload = () => resolve()
                        s.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
                        document.head.appendChild(s)
                      })
                    }
                    const options = {
                      key: j.key_id,
                      amount: j.order.amount,
                      currency: j.order.currency,
                      name: selectedHotel.name,
                      description: `Hotel booking for ${selectedHotel.name}`,
                      order_id: j.order.id,
                      handler: async (resp: any) => {
                        try {
                          const confirmation = await fetch('/api/services/requests', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'confirm_payment',
                              requestId: j.id,
                              payment: {
                                razorpay_payment_id: resp.razorpay_payment_id,
                                razorpay_order_id: resp.razorpay_order_id,
                                razorpay_signature: resp.razorpay_signature,
                              },
                            }),
                          })
                          const confirmationBody = await confirmation.json()
                          if (!confirmation.ok || !confirmationBody.confirmed) {
                            toast.error(confirmationBody.error || 'Payment verification failed')
                            return
                          }
                          toast.success('Payment successful. Hotel booking confirmed.')
                          setHotelDialogOpen(false)
                          setSelectedHotel(null)
                        } catch (error) {
                          console.error('Hotel payment confirmation failed', error)
                          toast.error('Payment completed, but booking confirmation failed')
                        }
                      },
                      prefill: { contact: selectedHotel.phone || '' },
                      theme: { color: '#F97316' }
                    }
                    const rzp = new (window as any).Razorpay(options)
                    rzp.open()
                    return
                  } catch (err:any) {
                    console.error('Razorpay checkout failed', err)
                    toast.error('Payment failed to start')
                    return
                  }
                }

                toast.error('Payment order was not created')
                setHotelDialogOpen(false)
                setSelectedHotel(null)
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2"/> Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dining Reservation Dialog */}
      <Dialog open={diningDialogOpen} onOpenChange={(o)=>{ setDiningDialogOpen(o); if (!o) { setSelectedDining(null); setDiningReservation({ date: '', time: '' }) } }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-primary">Book a Table</DialogTitle>
            <DialogDescription>Select date and time for your reservation.</DialogDescription>
          </DialogHeader>
          {selectedDining && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 bg-gradient-to-r from-[#6a2b2b] via-[#6f2d2d] to-[#5a2424] text-white border border-white/10">
                <div className="text-lg font-semibold">{selectedDining.name}</div>
                {selectedDining.address && (
                  <div className="text-amber-100/90 mt-1 inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedDining.address}</div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Date</div>
                  <input type="date" className="mt-1 w-full h-10 rounded-md border px-3" value={diningReservation.date} onChange={(e)=> setDiningReservation(p=>({ ...p, date: e.target.value }))} />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Time</div>
                  <input type="time" className="mt-1 w-full h-10 rounded-md border px-3" value={diningReservation.time} onChange={(e)=> setDiningReservation(p=>({ ...p, time: e.target.value }))} />
                </div>
              </div>
              {(() => {
                const perPerson = Number(selectedDining.priceINR || 0)
                const count = Math.max(1, Number(guests || 1))
                const subtotal = perPerson * count
                const gstRate = 0.05
                const gstPct = Math.round(gstRate * 100)
                const gstAmt = Math.round(subtotal * gstRate)
                const total = subtotal + gstAmt
                return (
                  <div className="rounded-xl border p-4">
                    <div className="text-primary font-semibold mb-2">Bill Summary</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between"><span>Price per person</span><span>₹{formatINR(perPerson)}</span></div>
                      <div className="flex items-center justify-between"><span>Guests</span><span>{count}</span></div>
                      <div className="flex items-center justify-between font-medium"><span>Subtotal</span><span>₹{formatINR(subtotal)}</span></div>
                      <div className="flex items-center justify-between"><span>GST ({gstPct}%)</span><span>₹{formatINR(gstAmt)}</span></div>
                      <div className="h-px bg-border my-2" />
                      <div className="flex items-center justify-between text-lg font-extrabold"><span>Total</span><span>₹{formatINR(total)}</span></div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Restaurant GST assumed at 5%. Final bill may vary at venue.</div>
                  </div>
                )
              })()}
              <div className="text-xs text-muted-foreground">We’ll request your table for the selected slot. Final confirmation depends on availability.</div>
            </div>
          )}
          <DialogFooter>
            <Button
              disabled={!diningReservation.date || !diningReservation.time}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
              onClick={async()=>{
                if (!selectedDining) return
                const perPerson = Number(selectedDining.priceINR || 0)
                const count = Math.max(1, Number(guests || 1))
                const subtotal = perPerson * count
                const gstRate = 0.05
                const gstAmt = Math.round(subtotal * gstRate)
                const total = subtotal + gstAmt
                const payload = { type: 'dining', item: selectedDining, monasteryId, reservation: diningReservation, guests: count, bill: { perPerson, subtotal, gstRate, gstAmt, total } }
                const r = await fetch('/api/services/requests', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                const j = await r.json()
                if (!r.ok) { toast.error(j.error || 'Failed'); return }

                if (j?.order && j?.key_id) {
                  try {
                    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
                      await new Promise<void>((resolve, reject) => {
                        const s = document.createElement('script')
                        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
                        s.onload = () => resolve()
                        s.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
                        document.head.appendChild(s)
                      })
                    }
                    const options = {
                      key: j.key_id,
                      amount: j.order.amount,
                      currency: j.order.currency,
                      name: selectedDining.name,
                      description: `Dining reservation at ${selectedDining.name}`,
                      order_id: j.order.id,
                      handler: async (resp: any) => {
                        const confirmed = await verifyPayment(j.id, resp)
                        if (!confirmed) return
                        toast.success('Payment successful. Dining reservation confirmed.')
                        setDiningDialogOpen(false)
                        setSelectedDining(null)
                        setDiningReservation({ date:'', time:'' })
                      },
                      prefill: { contact: selectedDining.phone || '' },
                      theme: { color: '#F97316' }
                    }
                    const rzp = new (window as any).Razorpay(options)
                    rzp.open()
                    return
                  } catch (err:any) {
                    console.error('Razorpay checkout failed', err)
                    toast.error('Payment failed to start')
                    return
                  }
                }

                toast.error('Payment order was not created')
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2"/> Confirm Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Tours Booking Dialog */}
      <Dialog open={toursDialogOpen} onOpenChange={(o)=>{ setToursDialogOpen(o); if (!o) { setSelectedTour(null); setTourReservation({ date: '', time: '' }) } }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-primary">Book Experience</DialogTitle>
            <DialogDescription>Select date and time for your experience.</DialogDescription>
          </DialogHeader>
          {selectedTour && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 bg-gradient-to-r from-[#6a2b2b] via-[#6f2d2d] to-[#5a2424] text-white border border-white/10">
                <div className="text-lg font-semibold">{selectedTour.name}</div>
                {selectedTour.distanceKm !== undefined && (
                  <div className="text-amber-100/90 mt-1 inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> {Number(selectedTour.distanceKm).toFixed(2)} km from {m?.name}</div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Date</div>
                  <input type="date" className="mt-1 w-full h-10 rounded-md border px-3" value={tourReservation.date} onChange={(e)=> setTourReservation(p=>({ ...p, date: e.target.value }))} />
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Time</div>
                  <input type="time" className="mt-1 w-full h-10 rounded-md border px-3" value={tourReservation.time} onChange={(e)=> setTourReservation(p=>({ ...p, time: e.target.value }))} />
                </div>
              </div>
              {selectedTour.priceINR ? (() => {
                const perPerson = Number(selectedTour.priceINR || 0)
                const count = Math.max(1, Number(guests || 1))
                const subtotal = perPerson * count
                const gstRate = 0.05
                const gstPct = Math.round(gstRate * 100)
                const gstAmt = Math.round(subtotal * gstRate)
                const total = subtotal + gstAmt
                return (
                  <div className="rounded-xl border p-4">
                    <div className="text-primary font-semibold mb-2">Bill Summary</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between"><span>Price per person</span><span>₹{formatINR(perPerson)}</span></div>
                      <div className="flex items-center justify-between"><span>Guests</span><span>{count}</span></div>
                      <div className="flex items-center justify-between font-medium"><span>Subtotal</span><span>₹{formatINR(subtotal)}</span></div>
                      <div className="flex items-center justify-between"><span>GST ({gstPct}%)</span><span>₹{formatINR(gstAmt)}</span></div>
                      <div className="h-px bg-border my-2" />
                      <div className="flex items-center justify-between text-lg font-extrabold"><span>Total</span><span>₹{formatINR(total)}</span></div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Final confirmation depends on availability.</div>
                  </div>
                )
              })() : (
                <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                  Google Places does not provide a verified activity price. Use the official website or Google Maps listing for current availability and pricing.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              disabled={!tourReservation.date || !tourReservation.time}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
              onClick={async()=>{
                if (!selectedTour) return
                const perPerson = Number(selectedTour.priceINR || 0)
                const count = Math.max(1, Number(guests || 1))
                const subtotal = perPerson * count
                const gstRate = 0.05
                const gstAmt = Math.round(subtotal * gstRate)
                const total = subtotal + gstAmt
                const payload = { type: 'tours', item: selectedTour, monasteryId, reservation: tourReservation, guests: count, bill: { perPerson, subtotal, gstRate, gstAmt, total } }
                const r = await fetch('/api/services/requests', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                const j = await r.json()
                if (!r.ok) { toast.error(j.error||'Failed'); return }

                if (j?.order && j?.key_id) {
                  try {
                    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
                      await new Promise<void>((resolve, reject) => {
                        const s = document.createElement('script')
                        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
                        s.onload = () => resolve()
                        s.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
                        document.head.appendChild(s)
                      })
                    }
                    const options = {
                      key: j.key_id,
                      amount: j.order.amount,
                      currency: j.order.currency,
                      name: selectedTour.name,
                      description: `Tour booking for ${selectedTour.name}`,
                      order_id: j.order.id,
                      handler: async (resp: any) => {
                        const confirmed = await verifyPayment(j.id, resp)
                        if (!confirmed) return
                        toast.success('Payment successful. Activity booking confirmed.')
                        setToursDialogOpen(false)
                        setSelectedTour(null)
                        setTourReservation({ date:'', time:'' })
                      },
                      prefill: { contact: selectedTour.phone || '' },
                      theme: { color: '#F97316' }
                    }
                    const rzp = new (window as any).Razorpay(options)
                    rzp.open()
                    return
                  } catch (err:any) {
                    console.error('Razorpay checkout failed', err)
                    toast.error('Payment failed to start')
                    return
                  }
                }

                toast.error('Payment order was not created')
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2"/> Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
