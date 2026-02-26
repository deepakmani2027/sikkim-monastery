"use client"
import { useEffect, useMemo, useState } from "react"
import { monasteries } from "@/lib/monasteries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Car, Bike, MapPin, Clock, IndianRupee, Phone, Loader2 } from "lucide-react"
import { GoogleMap } from "@/components/interactive/google-map"
import { AddressAutocomplete } from "@/components/interactive/address-autocomplete"
import { haversineKm } from "@/lib/utils"
import { regionBBoxes } from "@/lib/regions"

type Contact = {
  id: string
  name: string
  phone?: string
  coordinates: { lat: number; lng: number }
  address?: string
  operator?: string
  distanceKm?: number
  detourKm?: number
}

function useGeolocate() {
  const [coords, setCoords] = useState<{lat:string,lng:string}>({ lat: "", lng: "" })
  useEffect(()=>{
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p)=>{
        setCoords({ lat: p.coords.latitude.toFixed(5), lng: p.coords.longitude.toFixed(5) })
      })
    }
  },[])
  return coords
}

export function TransportPanel() {
  const geo = useGeolocate()
  const [from, setFrom] = useState<{lat:string,lng:string,label?:string}>({ lat: "", lng: "" })
  const [fromText, setFromText] = useState("")
  useEffect(()=>{ if (!from.lat && geo.lat) { setFrom(geo); setFromText("Current location") } },[geo])
  const [monasteryId, setMonasteryId] = useState<string>(monasteries[0]?.id || "")
  const dest = useMemo(()=> monasteries.find(m=>m.id===monasteryId), [monasteryId])
  const [pricing, setPricing] = useState<any[]|null>(null)
  const [pricingLoading, setPricingLoading] = useState(false)
  const [loadingUserContacts, setLoadingUserContacts] = useState(false)
  const [loadingDestContacts, setLoadingDestContacts] = useState(false)
  const [contactsUser, setContactsUser] = useState<{ taxi: Contact[]; bus: Contact[] }>({ taxi: [], bus: [] })
  const [contactsDest, setContactsDest] = useState<{ taxi: Contact[]; bus: Contact[] }>({ taxi: [], bus: [] })
  const [resolvingPhones, setResolvingPhones] = useState<Record<string, boolean>>({})

  // Prefer explicit "from" if provided; else fall back to geolocation
  const userCoords = useMemo(()=>{
    if (from.lat && from.lng) return { lat: Number(from.lat), lng: Number(from.lng) }
    if (geo.lat && geo.lng) return { lat: Number(geo.lat), lng: Number(geo.lng) }
    return null
  }, [from, geo])

  function isInSikkim(lat:number, lng:number){
    // Compute union bbox from regionBBoxes
    const boxes = Object.values(regionBBoxes)
    const south = Math.min(...boxes.map(b=>b[0]))
    const west = Math.min(...boxes.map(b=>b[1]))
    const north = Math.max(...boxes.map(b=>b[2]))
    const east = Math.max(...boxes.map(b=>b[3]))
    return lat >= south && lat <= north && lng >= west && lng <= east
  }
  const inSikkim = useMemo(()=> userCoords ? isInSikkim(userCoords.lat, userCoords.lng) : false, [userCoords])

  function telHref(phone:string){
    const cleaned = String(phone).replace(/[^+\d]/g, '')
    return `tel:${cleaned}`
  }

  async function resolveAndCall(item: Contact, type: 'taxi_stand'|'bus_station'){
    try {
      setResolvingPhones((s)=> ({ ...s, [item.id]: true }))
      // If already have phone, dial immediately
      if (item.phone){ window.open(telHref(item.phone),'_self'); return }
      const label = item.name && item.name !== 'Unnamed' ? item.name : (type === 'taxi_stand' ? 'taxi stand' : 'bus station')
      const near = `${item.coordinates.lat},${item.coordinates.lng}`
      const text = `${label} near ${fromText || 'Sikkim'}`.trim()
      const qs = new URLSearchParams({ text, near, radius: String(10000), type })
      const r = await fetch(`/api/services/places?${qs.toString()}`)
      if (r.ok){
        const j = await r.json()
        const candidate = (j.results||[])[0]
        if (candidate?.id){
          const r2 = await fetch(`/api/services/places?placeId=${encodeURIComponent(candidate.id)}`)
          if (r2.ok){
            const j2 = await r2.json()
            const phone = j2?.result?.phone
            if (phone){
              item.phone = phone
              setContactsUser((s)=> ({
                taxi: s.taxi.map((x:Contact)=> x.id===item.id? { ...x, phone }: x),
                bus: s.bus.map((x:Contact)=> x.id===item.id? { ...x, phone }: x),
              }))
              setContactsDest((s)=> ({
                taxi: s.taxi.map((x:Contact)=> x.id===item.id? { ...x, phone }: x),
                bus: s.bus.map((x:Contact)=> x.id===item.id? { ...x, phone }: x),
              }))
              window.open(telHref(phone), '_self')
              return
            }
          }
        }
      }
      // Fallback: open a web search so user can pick a number
      const q = `${label} phone near ${dest?.name || ''} Sikkim`
      window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank')
    } catch (e:any) {
      toast.error('Unable to find a contact number')
    } finally {
      setResolvingPhones((s)=> ({ ...s, [item.id]: false }))
    }
  }

  function computeFallbackPricing(distanceKm: number){
    const vehicles = [
      { id: 'bike', base: 40, perKm: 12, speedKmh: 35 },
      { id: 'car-hatchback', base: 60, perKm: 15, speedKmh: 40 },
      { id: 'car-sedan', base: 80, perKm: 18, speedKmh: 45 },
      { id: 'car-suv', base: 100, perKm: 22, speedKmh: 45 },
    ]
    return vehicles.map(v=> ({
      id: v.id,
      vehicleType: v.id,
      distanceKm: Number(distanceKm.toFixed(2)),
      etaMin: Math.round((distanceKm / v.speedKmh) * 60 + 5),
      estimatedPriceINR: Math.round(v.base + v.perKm * distanceKm)
    }))
  }

  async function fetchPricing(){
    // If user hasn't typed but geolocation available, auto fill
    if ((!from.lat || !from.lng) && geo.lat && geo.lng){
      setFrom({ lat: geo.lat, lng: geo.lng, label: 'Current location' })
    }
    const useFrom = (from.lat && from.lng) ? from : (geo.lat && geo.lng ? { lat: geo.lat, lng: geo.lng } : null)
    if (!useFrom || !dest) { toast.error("Enter or detect both origin and destination"); return }
    setPricingLoading(true)
    setPricing(null)
    try {
      const r = await fetch(`/api/services/transport?from=${useFrom.lat},${useFrom.lng}&to=${dest.coordinates.lat},${dest.coordinates.lng}`)
      let j: any = null
      try { j = await r.json() } catch {}
      if (!r.ok || !j?.options){
        throw new Error(j?.error || 'Transport pricing unavailable')
      }
      setPricing(j.options)
      toast.success(`Found ${j.options.length} options`)
    } catch (e:any) {
      // Fallback simple computation if API failed
      try {
        const distanceKm = dest ? haversineKm({ lat: Number(useFrom.lat), lng: Number(useFrom.lng) }, dest.coordinates) : 0
        const fallback = computeFallbackPricing(distanceKm)
        setPricing(fallback)
        toast.message(e?.message ? `${e.message}; using estimates` : 'Using estimated pricing')
      } catch {
        toast.error(e?.message || 'Pricing failed')
      }
    } finally { setPricingLoading(false) }
  }

  // Helper to sort and enrich a set
  function sortWithDistance(origin: {lat:number,lng:number}, arr: Contact[]) {
    return arr
      .filter(x=>x.coordinates?.lat && x.coordinates?.lng)
      .map(x=> ({ ...x, distanceKm: Number(haversineKm(origin, x.coordinates).toFixed(1)) }))
      .sort((a,b)=> a.distanceKm - b.distanceKm)
  }

  async function fetchGoogleNearby(lat:number, lng:number, radius:number){
    const paramsTaxi = new URLSearchParams({ near: `${lat},${lng}`, radius: String(radius), type: 'taxi_stand' })
    const paramsBus = new URLSearchParams({ near: `${lat},${lng}`, radius: String(radius), type: 'bus_station' })
    const [rt, rb] = await Promise.all([
      fetch(`/api/services/places?${paramsTaxi.toString()}`),
      fetch(`/api/services/places?${paramsBus.toString()}`),
    ])
    const [jt, jb] = await Promise.all([rt.json(), rb.json()])
    if (jt?.disabled || jb?.disabled) return { taxi: [] as Contact[], bus: [] as Contact[], disabled: true }
    const mapPlace = (p:any): Contact => ({
      id: p.id,
      name: p.name || 'Unnamed',
      phone: p.phone,
      coordinates: { lat: p.location?.lat, lng: p.location?.lng },
      address: p.address || p.vicinity,
    })
    return { taxi: (jt.results||[]).map(mapPlace), bus: (jb.results||[]).map(mapPlace), disabled: false }
  }

  async function fetchOsmNearby(lat:number, lng:number, radius:number){
    const qs = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius), include: 'taxi,bus' })
    const r = await fetch(`/api/services/osm?${qs.toString()}`)
    if (!r.ok) throw new Error('OSM unavailable')
    const j = await r.json()
    return { taxi: (j.taxi||[]) as Contact[], bus: (j.bus||[]) as Contact[] }
  }

  // Fetch nearby taxi and bus stand contacts near user location (Sikkim only)
  useEffect(()=>{
    let cancelled = false
    async function run(){
      if (!userCoords) return
      if (!inSikkim){ setContactsUser({ taxi: [], bus: [] }); return }
      try {
        setLoadingUserContacts(true)
        const lat = userCoords.lat
        const lng = userCoords.lng
        const radius = 15000 // 15 km

        let taxi: Contact[] = []
        let bus: Contact[] = []
        try {
          const g = await fetchGoogleNearby(lat, lng, radius)
          if (!g.disabled) { taxi = g.taxi; bus = g.bus }
          else {
            const o = await fetchOsmNearby(lat, lng, radius)
            taxi = o.taxi; bus = o.bus
          }
        } catch {
          const o = await fetchOsmNearby(lat, lng, radius)
          taxi = o.taxi; bus = o.bus
        }

        const onlySikkim = (arr:Contact[]) => arr.filter(x=> isInSikkim(Number(x.coordinates.lat), Number(x.coordinates.lng)) && x.name !== 'Unnamed')
        const sortedTaxi = sortWithDistance(userCoords, onlySikkim(taxi)).slice(0, 20)
        const sortedBus = sortWithDistance(userCoords, onlySikkim(bus)).slice(0, 20)
        if (!cancelled) setContactsUser({ taxi: sortedTaxi, bus: sortedBus })

        // Try to enrich missing phone numbers using Google Places proxy if configured
        async function enrichPhones(items:any[], type: 'taxi_stand'|'bus_station'){
          const targets = items.filter(x=>!x.phone).slice(0, 8)
          for (const it of targets){
            if (cancelled) break
            setResolvingPhones((s)=> ({ ...s, [it.id]: true }))
            try {
              const near = `${it.coordinates.lat},${it.coordinates.lng}`
              const qs = new URLSearchParams({ text: it.name || (type==='taxi_stand' ? 'taxi' : 'bus stand'), type, near, radius: String(7000) })
              const r = await fetch(`/api/services/places?${qs.toString()}`)
              if (!r.ok) throw new Error('places unavailable')
              const j = await r.json()
              const cand = (j.results||[])[0]
              if (cand?.id){
                const r2 = await fetch(`/api/services/places?placeId=${encodeURIComponent(cand.id)}`)
                if (r2.ok){
                  const j2 = await r2.json()
                  const phone = j2?.result?.phone
                  const addr = j2?.result?.address
                  if (phone){ it.phone = phone }
                  if (addr){ it.address = it.address || addr }
                }
              }
            } catch {}
            finally {
              setResolvingPhones((s)=> ({ ...s, [it.id]: false }))
            }
          }
        }

        // Fire and forget enrichments
        enrichPhones(sortedTaxi, 'taxi_stand')
        enrichPhones(sortedBus, 'bus_station')
      } catch (e:any) {
        if (!cancelled) {
          console.error(e)
          toast.message('Could not load local transport contacts')
        }
      } finally { if (!cancelled) setLoadingUserContacts(false) }
    }
    run()
    return ()=> { cancelled = true }
  }, [userCoords, inSikkim])

  // Fetch nearby taxi and bus stand contacts near selected monastery (always; monasteries are in Sikkim)
  useEffect(()=>{
    let cancelled = false
    async function run(){
      if (!dest) return
      try {
        setLoadingDestContacts(true)
        const lat = dest.coordinates.lat
        const lng = dest.coordinates.lng
        const radius = 15000

        let taxi: Contact[] = []
        let bus: Contact[] = []
        try {
          const g = await fetchGoogleNearby(lat, lng, radius)
          if (!g.disabled) { taxi = g.taxi; bus = g.bus }
          else {
            const o = await fetchOsmNearby(lat, lng, radius)
            taxi = o.taxi; bus = o.bus
          }
        } catch {
          const o = await fetchOsmNearby(lat, lng, radius)
          taxi = o.taxi; bus = o.bus
        }

        const onlySikkim = (arr:Contact[]) => arr.filter(x=> isInSikkim(Number(x.coordinates.lat), Number(x.coordinates.lng)) && x.name !== 'Unnamed')
        const sortedTaxi = sortWithDistance(dest.coordinates, onlySikkim(taxi)).slice(0, 20)
        const sortedBus = sortWithDistance(dest.coordinates, onlySikkim(bus)).slice(0, 20)
        if (!cancelled) setContactsDest({ taxi: sortedTaxi, bus: sortedBus })
      } catch (e:any) {
        if (!cancelled) {
          console.error(e)
          toast.message('Could not load monastery transport contacts')
        }
      } finally { if (!cancelled) setLoadingDestContacts(false) }
    }
    run()
    return ()=> { cancelled = true }
  }, [dest])

  // Recommended taxi stands for the chosen monastery from user's location (min detour)
  const recommendedTaxi: Contact[] = useMemo(()=>{
    if (!userCoords || !dest) return []
    const base = haversineKm(userCoords, dest.coordinates)
    return contactsUser.taxi
      .map((t)=>{
        const via = haversineKm(userCoords, t.coordinates) + haversineKm(t.coordinates, dest.coordinates)
        const detourKm = Number((via - base).toFixed(1))
        return { ...t, detourKm }
      })
      .sort((a,b)=> a.detourKm! - b.detourKm!)
      .slice(0, 8)
  }, [contactsUser.taxi, userCoords, dest])

  return (
    <section>
      <Card className="rounded-[28px] border border-amber-200/60 bg-amber-50/80 shadow-sm ring-1 ring-amber-100">
          <CardHeader className="pb-0">
            <div className="-mx-6 -mt-6 rounded-t-[28px] bg-gradient-to-r from-amber-200 via-orange-300 to-amber-600 px-6 py-5">
              <CardTitle className="text-3xl font-extrabold tracking-tight text-primary">Transport & Tourism</CardTitle>
              <p className="text-base mt-1 text-foreground">Auto-detect your location or enter an address; choose monastery; compare prices for bike/car.</p>
            </div>
            
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="text-primary font-semibold text-lg">Trip Details</div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5">
              <Label className="text-primary font-semibold mb-2 block">From</Label>
              <AddressAutocomplete
                value={fromText}
                onChange={setFromText}
                onSelect={(coords, label)=> { setFrom({ lat: coords.lat.toFixed(5), lng: coords.lng.toFixed(5), label }); setFromText(label) }}
                placeholder="Enter your location"
              />
            </div>
            <div className="md:col-span-3">
              <Label className="text-primary font-semibold mb-2 block">Destination Monastery</Label>
              {/* Mobile: native select to avoid off-screen popovers */}
              <select
                className="sm:hidden block w-full h-12 rounded-2xl bg-white/90 border border-amber-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={monasteryId}
                onChange={(e)=> setMonasteryId(e.target.value)}
              >
                {monasteries.map((m)=> (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {/* Tablet/Desktop: Radix select with portal and max height */}
              <div className="hidden sm:block">
                <Select value={monasteryId} onValueChange={setMonasteryId}>
                  <SelectTrigger className="bg-white/90 border-amber-300 rounded-2xl h-12 w-full focus:ring-primary/30">
                    <SelectValue placeholder="Choose a monastery" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={8} className="z-[60] w-[var(--radix-select-trigger-width)] max-h-[50vh] overflow-auto bg-amber-50/95 border border-amber-300 rounded-2xl shadow-lg">
                    {monasteries.map((m)=> (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <Button disabled={pricingLoading} className="w-full h-12 rounded-2xl text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-60" onClick={fetchPricing}>
                {pricingLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Loading...</> : 'Get Prices'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Auto-detected or type to search. You can edit manually.</p>

          {pricing && (
            <div className="grid md:grid-cols-2 gap-4">
              {pricing.map((opt:any)=> (
                <div
                  key={opt.id}
                  className="group relative overflow-hidden rounded-3xl border border-amber-400/70 bg-gradient-to-br from-amber-100/90 via-amber-200/80 to-yellow-50/90 p-6 text-base shadow-sm ring-1 ring-amber-300/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-amber-500/60"
                >
                  {/* subtle decorative blobs */}
                  <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />

                  <div className="relative flex items-center justify-between">
                    <div className="font-semibold flex items-center gap-2 text-primary">
                      {opt.vehicleType === 'bike' ? <Bike className="h-5 w-5"/> : <Car className="h-5 w-5"/>}
                      {opt.vehicleType.replace('car-','car ')}
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm">
                      <IndianRupee className="h-4 w-4"/>{opt.estimatedPriceINR}
                    </div>
                  </div>

                  <div className="relative mt-3 flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50/90 px-3 py-1 ring-1 ring-amber-300 text-amber-900">
                      <MapPin className="h-4 w-4"/> {opt.distanceKm} km
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50/90 px-3 py-1 ring-1 ring-amber-300 text-amber-900">
                      <Clock className="h-4 w-4"/> {opt.etaMin} min
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="relative z-[1] mt-4 w-full h-11 rounded-2xl text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    onClick={async()=>{
                      const payload = { type: 'transport', details: opt, bill: { total: Number(opt.estimatedPriceINR || 0) } }
                      const r = await fetch('/api/services/requests',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
                      const j = await r.json()
                      if (!r.ok) { toast.error(j.error||'Failed'); return }
                      if (j?.order) {
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
                            name: `Transport to ${opt.destination || ''}`,
                            description: `Transport booking`,
                            order_id: j.order.id,
                            handler: async (resp: any) => { toast.success('Payment successful') },
                            theme: { color: '#F97316' }
                          }
                          const rzp = new (window as any).Razorpay(options)
                          rzp.open()
                          return
                        } catch (err:any) {
                          console.error('Razorpay checkout failed', err)
                          toast.error('Payment failed to start')
                        }
                      }
                      toast.success('Booked request recorded')
                    }}
                  >
                    Book
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {userCoords && dest && (
        <div className="mt-6 h-80 w-full rounded-3xl overflow-hidden border border-amber-200 shadow-sm">
          <GoogleMap
            center={{ lat: dest.coordinates.lat, lng: dest.coordinates.lng }}
            fitBoundsToMarkers
            markers={[
              { position: { lat: dest.coordinates.lat, lng: dest.coordinates.lng }, title: dest.name, iconUrl: '/marker-red-3d.svg' },
              { position: { lat: userCoords.lat, lng: userCoords.lng }, title: fromText || 'Your location', iconUrl: '/marker-red.svg' },
            ]}
            className="h-full w-full"
          />
        </div>
      )}

      {/* Nearby Transport Contacts (Near You in Sikkim) */}
      {userCoords && (
        <div className="mt-6">
          <Card className="rounded-[28px] border border-amber-200/60 bg-amber-50/70 shadow-sm ring-1 ring-amber-100">
            <CardHeader className="pb-2"><CardTitle className="text-2xl text-primary">Nearby Transport Contacts</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{inSikkim ? 'Around your current location in Sikkim.' : 'Outside Sikkim — set a location within Sikkim to see listings.'} Data from OpenStreetMap; availability and accuracy may vary.</p>
              {loadingUserContacts ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Loading contacts…</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="font-semibold text-primary mb-2">Local Taxi</div>
                    {contactsUser.taxi.length === 0 && (<div className="text-sm text-muted-foreground">No taxi listings found nearby.</div>)}
                    <ul className="space-y-2">
                      {contactsUser.taxi.map((x)=> (
                        <li key={x.id} className="flex items-center justify-between rounded-2xl bg-white/80 border border-amber-200 px-3 py-2">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-primary">{x.name}</div>
                            <div className="text-xs text-muted-foreground">{x.distanceKm} km • {x.address||'Taxi service'}</div>
                          </div>
                          {x.phone ? (
                            <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={()=> window.open(telHref(x.phone!),'_self')}>
                              <Phone className="h-4 w-4 mr-1"/> Call
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="rounded-full" disabled={!!resolvingPhones[x.id]} onClick={()=> resolveAndCall(x,'taxi_stand')}>
                              {resolvingPhones[x.id] ? <><Loader2 className="h-4 w-4 mr-1 animate-spin"/>Finding…</> : <><Phone className="h-4 w-4 mr-1"/> Call</>}
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-primary mb-2">Bus Stands</div>
                    {contactsUser.bus.length === 0 && (<div className="text-sm text-muted-foreground">No bus station listings found nearby.</div>)}
                    <ul className="space-y-2">
                      {contactsUser.bus.map((x)=> (
                        <li key={x.id} className="flex items-center justify-between rounded-2xl bg-white/80 border border-amber-200 px-3 py-2">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-primary">{x.name}</div>
                            <div className="text-xs text-muted-foreground">{x.distanceKm} km • {x.address||'Bus station'}</div>
                          </div>
                          {x.phone ? (
                            <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={()=> window.open(telHref(x.phone!),'_self')}>
                              <Phone className="h-4 w-4 mr-1"/> Call
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="rounded-full" disabled={!!resolvingPhones[x.id]} onClick={()=> resolveAndCall(x,'bus_station')}>
                              {resolvingPhones[x.id] ? <><Loader2 className="h-4 w-4 mr-1 animate-spin"/>Finding…</> : <><Phone className="h-4 w-4 mr-1"/> Call</>}
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommended taxi stands for selected monastery (from your location) */}
      {userCoords && dest && inSikkim && (
        <div className="mt-6">
          <Card className="rounded-[28px] border border-amber-200/60 bg-amber-50/70 shadow-sm ring-1 ring-amber-100">
            <CardHeader className="pb-2"><CardTitle className="text-2xl text-primary">Best Taxi Stands for {dest.name}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Recommended by minimal detour from your location to the monastery.</p>
              {recommendedTaxi.length === 0 ? (
                <div className="text-sm text-muted-foreground">No suitable taxi stands found nearby your route.</div>
              ) : (
                <ul className="space-y-2">
                  {recommendedTaxi.map((x)=> (
                    <li key={x.id} className="flex items-center justify-between rounded-2xl bg-white/80 border border-amber-200 px-3 py-2">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-primary">{x.name}</div>
                        <div className="text-xs text-muted-foreground">Detour {x.detourKm} km • {x.distanceKm} km from you</div>
                      </div>
                      {x.phone ? (
                        <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={()=> window.open(telHref(x.phone!),'_self')}>
                          <Phone className="h-4 w-4 mr-1"/> Call
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="rounded-full" disabled={!!resolvingPhones[x.id]} onClick={()=> resolveAndCall(x,'taxi_stand')}>
                          {resolvingPhones[x.id] ? <><Loader2 className="h-4 w-4 mr-1 animate-spin"/>Finding…</> : <><Phone className="h-4 w-4 mr-1"/> Call</>}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transport near selected Monastery */}
      {dest && (
        <div className="mt-6">
          <Card className="rounded-[28px] border border-amber-200/60 bg-amber-50/70 shadow-sm ring-1 ring-amber-100">
            <CardHeader className="pb-2"><CardTitle className="text-2xl text-primary">Around {dest.name}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Taxi stands and bus stations close to the selected monastery.</p>
              {loadingDestContacts ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Loading contacts…</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="font-semibold text-primary mb-2">Taxi near {dest.name}</div>
                    {contactsDest.taxi.length === 0 && (<div className="text-sm text-muted-foreground">No taxi listings near the monastery.</div>)}
                    <ul className="space-y-2">
                      {contactsDest.taxi.map((x)=> (
                        <li key={x.id} className="rounded-2xl bg-white/90 border border-amber-200 px-3 py-2 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium text-primary text-base leading-snug line-clamp-2 break-words">
                                {x.name}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-normal break-words">
                                {x.distanceKm} km • {x.address||'Taxi service'}
                              </div>
                            </div>
                            <div className="sm:shrink-0">
                              {x.phone ? (
                                <Button size="sm" className="w-full sm:w-auto rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={()=> window.open(telHref(x.phone!),'_self')}>
                                  <Phone className="h-4 w-4 mr-1"/> Call
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="w-full sm:w-auto rounded-full" disabled={!!resolvingPhones[x.id]} onClick={()=> resolveAndCall(x,'taxi_stand')}>
                                  {resolvingPhones[x.id] ? <><Loader2 className="h-4 w-4 mr-1 animate-spin"/>Finding…</> : <><Phone className="h-4 w-4 mr-1"/> Call</>}
                                </Button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-primary mb-2">Bus stands near {dest.name}</div>
                    {contactsDest.bus.length === 0 && (<div className="text-sm text-muted-foreground">No bus station listings near the monastery.</div>)}
                    <ul className="space-y-2">
                      {contactsDest.bus.map((x)=> (
                        <li key={x.id} className="rounded-2xl bg-white/90 border border-amber-200 px-3 py-2 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium text-primary text-base leading-snug line-clamp-2 break-words">
                                {x.name}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-normal break-words">
                                {x.distanceKm} km • {x.address||'Bus station'}
                              </div>
                            </div>
                            <div className="sm:shrink-0">
                              {x.phone ? (
                                <Button size="sm" className="w-full sm:w-auto rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={()=> window.open(telHref(x.phone!),'_self')}>
                                  <Phone className="h-4 w-4 mr-1"/> Call
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="w-full sm:w-auto rounded-full" disabled={!!resolvingPhones[x.id]} onClick={()=> resolveAndCall(x,'bus_station')}>
                                  {resolvingPhones[x.id] ? <><Loader2 className="h-4 w-4 mr-1 animate-spin"/>Finding…</> : <><Phone className="h-4 w-4 mr-1"/> Call</>}
                                </Button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  )
}
