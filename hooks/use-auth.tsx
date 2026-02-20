"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
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

  useEffect(() => {
    let unsub: (() => void) | null = null
    async function init() {
      if (!isSupabaseEnabled() || !supabase) {
        // Supabase not enabled; keep unauthenticated state
        setLoading(false)
        return
      }
      // Get initial session
      const { data } = await supabase.auth.getSession()
      await refreshUser(data.session?.user?.id || null)

      // Subscribe to auth changes
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        refreshUser(session?.user?.id || null)
      })
      unsub = () => sub.subscription.unsubscribe()
      setLoading(false)
    }
    init()
    return () => {
      if (unsub) unsub()
    }
  }, [])

  const refreshUser = async (uid: string | null) => {
    if (!isSupabaseEnabled() || !supabase || !uid) {
      setAuthState({ user: null, isAuthenticated: false })
      return
    }
    // Load profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,email,name,role,created_at")
      .eq("id", uid)
      .maybeSingle()

    if (profile) {
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
    } else {
      // Fallback to auth user when profile not found yet
      const { data: authUser } = await supabase.auth.getUser()
      const u = authUser.user
      if (u) {
        setAuthState({
          user: { id: u.id, email: u.email || "", name: u.user_metadata?.full_name, role: "tourist" },
          isAuthenticated: true,
        })
      } else {
        setAuthState({ user: null, isAuthenticated: false })
      }
    }
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
    await refreshUser(data.user?.id || null)
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
