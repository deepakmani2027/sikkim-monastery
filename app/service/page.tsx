"use client"
import Link from "next/link"
import { useRef, useState } from "react"
import { Car, CalendarDays } from "lucide-react"
import { TransportPanel } from "@/components/service/transport-panel"
import { BookingPanel } from "@/components/service/booking-panel"
import { Navbar } from "@/components/layout/navbar"

export default function ServiceHubPage() {
  const [showTransport, setShowTransport] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  function openTransportInline() {
    setShowTransport(true)
    setShowBooking(false)
    queueMicrotask(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
  function openBookingInline() {
    setShowBooking(true)
    setShowTransport(false)
    queueMicrotask(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="-mx-4 sm:-mx-6 lg:-mx-8">
          <div className="rounded-3xl  px-4 sm:px-6 lg:px-8 py-8 text-center ring-amber-100">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">Premium Services Hub</h1>
            <p className="mt-2 text-base sm:text-lg text-foreground/90">Complete travel solutions for your Sikkim monastery journey</p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {/* Transport & Tourism tile */}
          <button
            type="button"
            onClick={openTransportInline}
            aria-expanded={showTransport}
            className={`group relative isolate w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#6a2b2b] via-[#6f2d2d] to-[#5a2424] p-6 text-left text-white shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 ${showTransport ? 'ring-2 ring-amber-300/60 shadow-amber-600/30' : 'hover:-translate-y-0.5 hover:shadow-xl'}`}
          >
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center shrink-0">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight">Transport & Tourism</div>
                <div className="mt-1 text-base text-amber-50/90">Local transport services and tourism operators</div>
              </div>
            </div>
          </button>

          {/* Booking & Reservations tile */}
          <button
            type="button"
            onClick={openBookingInline}
            aria-expanded={showBooking}
            className={`group relative isolate w-full overflow-hidden rounded-3xl border border-yellow-900/10 bg-gradient-to-r from-[#b38900] via-[#a88400] to-[#8f7600] p-6 text-left shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300/70 ${showBooking ? 'ring-2 ring-yellow-300/70 shadow-yellow-700/30' : 'hover:-translate-y-0.5 hover:shadow-xl'}`}
          >
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-2xl bg-black/10 ring-1 ring-black/10 flex items-center justify-center shrink-0">
                <CalendarDays className="h-6 w-6 text-black/80" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-zinc-900">Booking & Reservations</div>
                <div className="mt-1 text-base text-zinc-800/90">Book hotels, activities, and dining experiences</div>
              </div>
            </div>
          </button>
        </section>

        {(showTransport || showBooking) && (
          <div ref={panelRef} className="mt-2">
            {showTransport ? <TransportPanel /> : <BookingPanel />}
          </div>
        )}
      </main>
    </div>
  )
}
