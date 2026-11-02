// This file can be removed or simplified if no other code depends on it.
// For now, we will just export the interfaces.

export interface User {
  id: string
  email: string
  name: string
  role: "tourist" | "researcher" | "admin"
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Minimal placeholder authService to satisfy imports in verify-otp page.
// Replace with real implementation if integrating Supabase or custom backend.
export const authService = {
  async registerWithoutLogin(
    email: string,
    password: string,
    name: string,
    role: "tourist" | "researcher" | "admin"
  ): Promise<{ success: boolean; error?: string }> {
    if (!email || !password) return { success: false, error: "Missing credentials" }
    try {
      const resp = await fetch('/api/auth/finalize-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok || !data.success) {
        return { success: false, error: data.error || `Signup failed (${resp.status})` }
      }
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error' }
    }
  },
}