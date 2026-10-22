'use client'

import type { ReactNode } from 'react'
import { Navigate, useLocation } from '../lib/nav'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../data/users'

type ProtectedRouteProps = {
  roles?: readonly string[]
  children?: ReactNode
}

export default function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/dashboard'} replace />
  }

  return children
}
