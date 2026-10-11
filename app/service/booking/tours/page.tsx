"use client"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { monasteries } from "@/lib/monasteries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, IndianRupee, Star } from "lucide-react"
import { toast } from "sonner"

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export default function ToursListPage(){
  const sp = useSearchParams()
  const monasteryId = sp.get('monasteryId') || monasteries[0]?.id
  const m = useMemo(()=> monasteries.find(x=>x.id===monasteryId), [monasteryId])
  const [items, setItems] = useState<any[]>([])
  useEffect(()=>{
    async function load(){
      if (!m) return
      const near = `${m.coordinates.lat},${m.coordinates.lng}`
      const google = await fetch(`/api/services/places?near=${near}&radius=5000&type=tourist_attraction&text=${encodeURIComponent(`tourist attractions activities near ${m.name}`)}`)
      if (google.ok) {
        const data = await google.json()
        const realItems = (data.results || [])
          .filter((it:any) => it.location?.lat != null && it.location?.lng != null)
          .map((it:any) => ({
            ...it,
            placeId: it.id,
            id: `google-${it.id}`,
            distanceKm: haversineKm(m.coordinates, it.location),
            priceINR: 1200,
            location: it.location,
          }))
          .filter((it:any) => it.distanceKm <= 5)
        if (realItems.length) {
          setItems(realItems)
          return
        }
      }
      const r = await fetch(`/api/services/nearby?near=${near}&radiusKm=5`)
      const j = await r.json()
      if (r.ok) setItems((j.tours || []).filter((it:any)=> Number(it?.distanceKm||0) <= 5))
    }
    load()
  },[m])
  return (
    <main className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold">Tours & Activities near {m?.name}</h1>
      <div className="grid gap-4">
        {items.map((x)=> (
          <Card key={x.id} className="border-yellow-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{x.name}</span>
                <span className="inline-flex items-center gap-1 text-sm"><Star className="h-4 w-4 text-yellow-600"/>{x.rating}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                <MapPin className="h-4 w-4"/>
                {typeof x.distanceKm === 'number' ? `${Number(x.distanceKm||0).toFixed(2)} km` : `Near ${m?.name}`}
              </div>
              <div className="font-semibold inline-flex items-center gap-1">
                <IndianRupee className="h-4 w-4"/>{new Intl.NumberFormat('en-IN').format(Math.round(Number(x.priceINR||0)))}
                <span className="text-xs text-muted-foreground pl-1">/person</span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={async()=>{
                const r = await fetch('/api/services/requests', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ type:'tour', item: x, monasteryId }) })
                const j = await r.json();
                if (r.ok) toast.success('Request recorded')
                else toast.error(j.error||'Failed')
                }}>Book</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
