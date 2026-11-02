"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Eye, EyeOff, Mail, User2, Lock, BadgeCheck } from "lucide-react"
import { Logo } from "@/components/branding/Logo"
import { toast } from "sonner"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface SignupFormProps {
  onToggleMode: () => void
}

export function SignupForm({ onToggleMode }: SignupFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as "tourist" | "researcher" | "admin" | "",
  })

  useEffect(() => { nameInputRef.current?.focus() }, [])

  // Global Enter fallback: if focus is outside but user presses Enter, submit.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement
        const tag = target?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  // Prefetch OTP page for faster navigation
  useEffect(() => {
    router.prefetch('/auth/verify-otp')
  }, [router])

  const sendOtp = useCallback(async (email: string) => {
    const resp = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await resp.json().catch(()=>({}))
    if(!resp.ok){
      throw new Error(data.error || 'Failed to send OTP')
    }
  },[])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.error("Please fill in all fields")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    // Store pending signup locally for OTP page
    try {
      localStorage.setItem("sikkim_pending_signup", JSON.stringify({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        name: formData.name,
        role: formData.role,
      }))
    } catch {}

    setSubmitting(true)
    const targetEmail = formData.email.trim().toLowerCase()
    // Fire-and-navigate quickly (optimistic). We'll still display error toast if sending fails.
    router.push('/auth/verify-otp')
    try {
      await sendOtp(targetEmail)
      toast.success('OTP Sent', { description: 'Enter the 6-digit code we emailed you.' })
    } catch(err:any){
      toast.error('Failed to send OTP', { description: err?.message || 'Network error'})
      // If sending failed, consider returning user back automatically after short delay.
      setTimeout(()=>{ router.replace('/auth') }, 2500)
    } finally {
      setSubmitting(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
      <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-12xl border-[0.5px] border-border/50 shadow-floating">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto">
            <Logo size={90} />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <BadgeCheck className="h-4 w-4" /> Create your account
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">Join Our Community</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create an account to explore Sikkim's monasteries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  ref={nameInputRef}
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-input border-border pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter your email"
                  className="bg-input border-border pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">
                I am a...
              </Label>
              <Select value={formData.role} onValueChange={(value) => updateFormData("role", value)} disabled={loading}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourist">Tourist - Explore and learn</SelectItem>
                  <SelectItem value="researcher">Researcher - Access archives</SelectItem>
                  <SelectItem value="admin">Admin - Manage content</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  placeholder="Create a password"
                  className="bg-input border-border pr-10 pl-9"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  placeholder="Confirm your password"
                  className="bg-input border-border pr-10 pl-9"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error display is now handled by toasts */}

            <Button
              type="submit"
              className="group relative w-full overflow-hidden rounded-md bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-[0_4px_18px_-4px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading || submitting}
            >
              <span className="pointer-events-none absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_60%)] transition-opacity duration-500 group-hover:opacity-60" />
              <span className="flex items-center justify-center gap-2 font-medium tracking-wide">
                {(loading || submitting) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Create Account</span>
                  </>
                )}
              </span>
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-primary hover:text-primary/80"
                onClick={onToggleMode}
              >
                Sign in here
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}