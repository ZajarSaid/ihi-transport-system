'use client'

import { ToastProvider } from './Toast'
import { AuthProvider } from '../context/AuthContext'
import { AuthSessionProvider } from './AuthSessionProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </AuthSessionProvider>
  )
}
