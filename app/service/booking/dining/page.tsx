"use client"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { monasteries } from "@/lib/monasteries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, IndianRupee, Star } from "lucide-react"
import { toast } from "sonner"

export default function DiningListPage(){
  const sp = useSearchParams()
  const monasteryId = sp.get('monasteryId') || monasteries[0]?.id
  const m = useMemo(()=> monasteries.find(x=>x.id===monasteryId), [monasteryId])
  const [items, setItems] = useState<any[]>([])
  useEffect(()=>{
    async function load(){
      if (!m) return
  const r = await fetch(`/api/services/nearby?near=${m.coordinates.lat},${m.coordinates.lng}&radiusKm=5`)
      const j = await r.json()
  if (r.ok) setItems((j.dining || []).filter((it:any)=> Number(it?.distanceKm||0) <= 5))
    }
    load()
  },[m])
  return (
    <main className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold">Local Dining near {m?.name}</h1>
      <div className="grid gap-4">
        {items.map((x)=> (
          <Card key={x.id} className="border-yellow-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{x.name}</span>
                <span className="inline-flex items-center gap-1 text-sm"><Star className="h-4 w-4 text-yellow-600"/>{x.rating}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground inline-flex items-center gap-2"><MapPin className="h-4 w-4"/> {x.distanceKm} km</div>
              <div className="font-semibold inline-flex items-center gap-1"><IndianRupee className="h-4 w-4"/>{x.priceINR}</div>
              <Button onClick={async()=>{
                const r = await fetch('/api/services/requests', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ type:'dining', item: x, monasteryId }) })
                const j = await r.json();
                if (r.ok) toast.success('Request recorded')
                else toast.error(j.error||'Failed')
              }}>Book</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
