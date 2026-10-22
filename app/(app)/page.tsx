'use client'

import { useAuth } from '@/src/context/AuthContext'
import { ROLE_HOME, type Role } from '@/src/data/users'
import { Navigate } from '@/src/lib/nav'

export default function Page() {
  const { user } = useAuth()
  return <Navigate to={ROLE_HOME[user?.role as Role] || '/dashboard'} replace />
}
