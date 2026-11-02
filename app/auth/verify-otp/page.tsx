"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound, Loader2, Mail, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { authService } from "@/lib/auth"
import { AUTH_BG_IMAGES } from "@/lib/authBackgrounds"

export default function VerifyOtpPage() {
  const router = useRouter()
  // Shorter cooldown for resending OTP
  const RESEND_COOLDOWN_SECONDS = 20
  // Background indices
  const [bgIndex, setBgIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [otp, setOtp] = useState("")
  const [otpInvalid, setOtpInvalid] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const [error, setError] = useState("")
  const [email, setEmail] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [role, setRole] = useState<"tourist" | "researcher" | "admin" | "">("")
  const [password, setPassword] = useState<string>("")
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sikkim_pending_signup")
      if (!raw) {
        router.replace("/auth")
        return
      }
      const data = JSON.parse(raw)
      if (!data?.email || !data?.password || !data?.name || !data?.role) {
        router.replace("/auth")
        return
      }
      setEmail((data.email || "").trim().toLowerCase())
      setName(data.name)
      setRole(data.role)
      setPassword(data.password)
    } catch {
      router.replace("/auth")
    }
  }, [router])

  useEffect(() => {
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  // Cycle backgrounds similar to /auth
  useEffect(() => {
    const total = AUTH_BG_IMAGES.length
    if (!total) return
    const interval = setInterval(() => {
      setBgIndex((i) => {
        setPrevIndex(i)
        return (i + 1) % total
      })
    }, 6500)
    return () => clearInterval(interval)
  }, [])

  // InputOTP manages focus

  // No manual per-box handlers needed

  const verify = async () => {
    setError("")
  const code = otp
    if (!code || code.length < 6) {
      setError("Enter the 6-digit OTP")
      return
    }
    try {
      setVerifyingOtp(true)
      const resp = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, email }),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        setOtpInvalid(true)
        throw new Error(data?.error || `Invalid OTP (${resp.status})`)
      }

      // Create account (without logging in), then redirect to login
      const result = await authService.registerWithoutLogin(email, password, name, role as any)
      if (!result.success) {
        const msg = (result.error || "registration failed").toLowerCase()
        if (msg.includes('already') || msg.includes('409')) {
          setError('This email is already registered. Please sign in.')
          return
        }
        setError(result.error || 'Registration failed')
        return
      }

      try { localStorage.removeItem("sikkim_pending_signup") } catch {}
      toast.success("Email verified. Account created. Please sign in.")
      router.replace("/auth")
    } catch (err: any) {
      setError(err?.message || "Invalid OTP")
    } finally {
      setVerifyingOtp(false)
    }
  }

  const resend = async () => {
    setError("")
    try {
      setSendingOtp(true)
      const resp = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data?.error || `Failed to resend OTP (${resp.status})`)
      }
      setResendIn(RESEND_COOLDOWN_SECONDS)
      toast.success("OTP resent")
    } catch (err: any) {
      setError(err?.message || "Failed to resend OTP")
    } finally {
      setSendingOtp(false)
    }
  }

  const total = AUTH_BG_IMAGES.length
  const hasImages = total > 0
  const currentBg = hasImages ? AUTH_BG_IMAGES[bgIndex % total] : ""
  const prevBg = prevIndex != null && hasImages ? AUTH_BG_IMAGES[prevIndex % total] : null
  const nextIndex = hasImages ? (bgIndex + 1) % total : 0
  const nextBg = hasImages ? AUTH_BG_IMAGES[nextIndex] : undefined

  // Preload next
  useEffect(() => {
    if (!nextBg) return
    const img = new Image()
    img.src = nextBg
  }, [nextBg])

  const inClass = "auth-slide-in"
  const outClass = "auth-slide-out"

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* New (current) background */}
      <div
        key={`curr-${bgIndex}`}
        className={`absolute inset-0 bg-cover bg-center will-change-transform auth-kenburns ${inClass}`}
        style={{ backgroundImage: `url(${currentBg})` }}
      />
      {/* Previous background animating out */}
      {prevBg && (
        <div
          key={`prev-${prevIndex}`}
          className={`absolute inset-0 bg-cover bg-center ${outClass}`}
          style={{ backgroundImage: `url(${prevBg})` }}
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-12xl border-[0.5px] border-border/50 shadow-floating">
        <CardHeader className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center shadow-soft">
            <div className="text-2xl text-primary-foreground">🔐</div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <KeyRound className="h-4 w-4" /> Verify your email
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">Enter OTP</CardTitle>
          <CardDescription className="text-muted-foreground">
            We sent a 6-digit code to your email
          </CardDescription>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" /> {email}</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-foreground flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Enter 6‑digit OTP
            </Label>
            <div className="flex items-center justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(v) => { setOtp(v.replace(/\D/g, "")); setOtpInvalid(false) }}
                containerClassName=""
              >
                <InputOTPGroup className="gap-2 sm:gap-3">
                  <InputOTPSlot index={0} className={`${otpInvalid ? "border-red-500 bg-red-50 text-red-600" : "bg-input border-border"} border rounded-md`} />
                  <InputOTPSlot index={1} className={`${otpInvalid ? "border-red-500 bg-red-50 text-red-600" : "bg-input border-border"} border rounded-md`} />
                  <InputOTPSlot index={2} className={`${otpInvalid ? "border-red-500 bg-red-50 text-red-600" : "bg-input border-border"} border rounded-md`} />
                  <InputOTPSlot index={3} className={`${otpInvalid ? "border-red-500 bg-red-50 text-red-600" : "bg-input border-border"} border rounded-md`} />
                  <InputOTPSlot index={4} className={`${otpInvalid ? "border-red-500 bg-red-50 text-red-600" : "bg-input border-border"} border rounded-md`} />
                  <InputOTPSlot index={5} className={`${otpInvalid ? "border-red-500 bg-red-50 text-red-600" : "bg-input border-border"} border rounded-md`} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{resendIn > 0 ? `Resend in ${resendIn}s` : "Didn't get the code?"}</span>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                disabled={resendIn > 0 || sendingOtp}
                onClick={resend}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Resend
              </Button>
            </div>
          </div>

          {error && <div className="mt-3 text-destructive text-sm text-center bg-destructive/10 p-2 rounded">{error}</div>}

          <Button
            type="button"
            className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-elevated"
            disabled={sendingOtp || verifyingOtp}
            onClick={verify}
          >
            {verifyingOtp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-3">
            Wrong email? <Button type="button" variant="link" className="p-0 h-auto" onClick={() => router.replace("/auth")}>Go back</Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
