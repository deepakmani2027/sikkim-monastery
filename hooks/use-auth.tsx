"use client"

import { useState, useEffect, useRef, createContext, useContext, type ReactNode } from "react"
import { supabase, isSupabaseEnabled } from "@/lib/supabase"
import { authenticateMockUser } from "@/lib/mockAuth"

type Role = "tourist" | "researcher" | "admin"

export interface AppUser {
  id: string
  email: string
  name?: string | null
  role: Role
  createdAt?: string
}

interface AuthState {
  user: AppUser | null
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string, role: Role) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    let unsub: (() => void) | null = null
    let active = true
    const initializationDeadline = window.setTimeout(() => {
      if (active) setLoading(false)
    }, 3000)
    async function init() {
      if (!isSupabaseEnabled() || !supabase) {
        // Supabase not enabled; keep unauthenticated state
        setLoading(false)
        return
      }
      const hasPersistedSession = Object.keys(window.localStorage).some(
        (key) => key.startsWith("sb-") && key.endsWith("-auth-token"),
      )
      if (!hasPersistedSession) {
        setLoading(false)
      }
      // Get initial session
      try {
        if (hasPersistedSession) {
          const sessionRequest = supabase.auth.getSession()
          const sessionTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500))
          const sessionResult = await Promise.race([sessionRequest, sessionTimeout])
          if (!active) return
          const session = sessionResult && "data" in sessionResult ? sessionResult.data.session : null
          void refreshUser(session?.user?.id || null, session?.user)
        }
      } catch (error) {
        console.error("[auth] Failed to restore session", error)
        if (active) setAuthState({ user: null, isAuthenticated: false })
      } finally {
        if (active) setLoading(false)
      }

      // Subscribe to auth changes
      if (!active) return
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        void refreshUser(session?.user?.id || null, session?.user)
      })
      unsub = () => sub.subscription.unsubscribe()
    }
    void init()
    return () => {
      active = false
      window.clearTimeout(initializationDeadline)
      if (unsub) unsub()
    }
  }, [])

  const refreshUser = async (uid: string | null, sessionUser?: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
    if (!isSupabaseEnabled() || !supabase || !uid) {
      setAuthState({ user: null, isAuthenticated: false })
      return
    }
    const fallbackUser: AppUser = {
      id: uid,
      email: sessionUser?.email || "",
      name: typeof sessionUser?.user_metadata?.full_name === "string" ? sessionUser.user_metadata.full_name : null,
      role: "tourist",
    }

    // Release the dashboard immediately using the authenticated session. The
    // profile query only enriches the role/name after the first render.
    setAuthState({ user: fallbackUser, isAuthenticated: true })

    const profileRequest = supabase
      .from("profiles")
      .select("id,email,name,role,created_at")
      .eq("id", uid)
      .maybeSingle()
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000))
    const result = await Promise.race([profileRequest, timeout]).catch(() => null)
    if (!result || !("data" in result) || !result.data) return

    const profile = result.data
    setAuthState({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as Role,
        createdAt: profile.created_at,
      },
      isAuthenticated: true,
    })
  }

  const login = async (email: string, password: string) => {
    if (!isSupabaseEnabled() || !supabase) return { success: false, error: "Auth disabled" }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      return { success: false, error: error.message }
    }
    const { data } = await supabase.auth.getUser()
    await refreshUser(data.user?.id || null, data.user || undefined)
    setLoading(false)
    return { success: true }
  }

  const register = async (_email: string, _password: string, _name: string, _role: Role) => {
    // Deprecated: direct register endpoint removed in favor of OTP flow.
    return { success: false, error: "Use OTP signup flow" }
  }

  const logout = async () => {
    if (!isSupabaseEnabled() || !supabase) return
    await supabase.auth.signOut()
    setAuthState({ user: null, isAuthenticated: false })
  }

  const resendConfirmationEmail = async (email: string) => {
    if (!isSupabaseEnabled() || !supabase) return { success: false, error: "Auth disabled" }
    const { error } = await supabase.auth.resend({ type: "signup", email: email })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        resendConfirmationEmail,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
