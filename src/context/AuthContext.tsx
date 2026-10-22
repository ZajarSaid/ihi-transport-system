'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { demoUsers, type Role } from '../data/users'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
  title: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (email: string, password: string) => AuthUser
  /**
   * `silent` clears the stored session without dropping the in-memory user.
   * The sign-out flow uses it so that only one navigation to /login happens
   * (see TopNav); a normal logout updates both.
   */
  logout: (options?: { silent?: boolean }) => void
  hasRole: (...roles: string[]) => boolean
}

const STORAGE_KEY = 'trs_auth_user'
const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function toSession(found: (typeof demoUsers)[number]): AuthUser {
  return {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    title: found.title,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  const login = useCallback((email: string, password: string) => {
    const normalized = String(email).trim().toLowerCase()
    const found = demoUsers.find(
      (u) => u.email.toLowerCase() === normalized && u.password === password,
    )
    if (!found) {
      throw new Error('Invalid email or password. Please try again.')
    }
    const session = toSession(found)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const logout = useCallback((options?: { silent?: boolean }) => {
    window.localStorage.removeItem(STORAGE_KEY)
    if (!options?.silent) setUser(null)
  }, [])

  const hasRole = useCallback(
    (...roles: string[]) => roles.includes(user?.role as string),
    [user],
  )

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
