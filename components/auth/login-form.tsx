"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react"
import { Logo } from "@/components/branding/Logo"
import { toast } from "sonner"

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, resendConfirmationEmail } = useAuth()

  const handleResendConfirmation = async () => {
    const promise = resendConfirmationEmail(email)
    toast.promise(promise, {
      loading: "Sending confirmation email...",
      success: "Confirmation email sent! Please check your inbox.",
      error: (err) => err.message || "Failed to send email.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    const result = await login(email, password)
    if (!result.success) {
      const errorMessage = result.error || "An unknown error occurred."
      if (errorMessage.toLowerCase().includes("email not confirmed")) {
        toast.error("Email not verified.", {
          description: "Please check your inbox to verify your email address before signing in.",
          action: {
            label: "Resend Email",
            onClick: handleResendConfirmation,
          },
          duration: 10000,
        })
      } else if (errorMessage.toLowerCase().includes("invalid login credentials")) {
        toast.error("Login Failed", {
          description: "Incorrect email or password. Please try again.",
        })
      } else {
        toast.error("Login Failed", {
          description: errorMessage,
        })
      }
    } else {
      toast.success("Signed in successfully!")
      router.push("/") // Redirect to dashboard on success
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
      <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-12xl border-[0.5px] border-border/50 shadow-floating">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto">
            <Logo size={90} />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" /> Secure access
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to explore Sikkim's sacred monasteries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-input border-border pl-9"
                disabled={loading}
              />
            </div>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
            <div className="flex items-center justify-end text-xs">
              <Button type="button" variant="link" className="p-0 h-auto text-primary">Forgot password?</Button>
            </div>
          </div>

          {/* Error display is now handled by toasts */}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-elevated"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-primary hover:text-primary/80"
              onClick={onToggleMode}
            >
              Sign up here
            </Button>
          </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

