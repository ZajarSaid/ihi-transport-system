import { auth } from '@/src/auth'
import { NextResponse } from 'next/server'
import { ROLE_HOME, ROUTE_ACCESS, type Role } from '@/src/data/users'

const PUBLIC_PATHS = ['/login', '/api/auth']

function isPublicPath(pathname: string) {
  if (pathname.startsWith('/api/')) return true
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  if (!req.auth?.user) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = req.auth.user.role as Role
  for (const rule of ROUTE_ACCESS) {
    if (pathname.startsWith(rule.prefix)) {
      if (!rule.roles.includes(role)) {
        return NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/', req.nextUrl.origin))
      }
      break
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map)$).*)'],
}
