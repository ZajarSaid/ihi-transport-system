'use client'

/*
 * This file is a router shim: it deliberately exports components (Link,
 * NavLink, Navigate) alongside hooks (useNavigate, useLocation, useParams).
 * Fast Refresh cannot preserve the state of a module that mixes the two, so
 * the rule is switched off for this file on purpose.
 */
/* eslint-disable react-refresh/only-export-components */

/**
 * React Router -> Next.js App Router compatibility layer.
 *
 * The UI components were written against react-router-dom. Rather than
 * rewriting every navigation call, the small surface they actually use
 * (Link, NavLink, useNavigate, useParams, useLocation, Navigate) is
 * re-implemented here on top of next/navigation.
 *
 * Semantics are deliberately matched to React Router v6/v7:
 *  - NavLink is "active" when the current path equals `to` or starts with
 *    `to` + "/" (no `end` prop is used anywhere in the app).
 *  - Navigate carries the "from" location through the `?from=` query
 *    parameter so `location.state.from.pathname` keeps working.
 */

import NextLink from 'next/link'
import { usePathname, useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, type AnchorHTMLAttributes, type ReactNode } from 'react'

export { useParams }

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

export function Link({
  to,
  children,
  ...rest
}: { to: string; children?: ReactNode } & AnchorProps) {
  return (
    <NextLink href={to} {...rest}>
      {children}
    </NextLink>
  )
}

export function NavLink({
  to,
  className,
  children,
  ...rest
}: {
  to: string
  className?: string | ((state: { isActive: boolean; isPending: boolean }) => string)
  children?: ReactNode
} & Omit<AnchorProps, 'className'>) {
  const pathname = usePathname() ?? '/'
  const isActive = isPathActive(to, pathname)
  const resolved =
    typeof className === 'function' ? className({ isActive, isPending: false }) : className

  return (
    <NextLink
      href={to}
      className={resolved}
      aria-current={isActive ? 'page' : undefined}
      {...rest}
    >
      {children}
    </NextLink>
  )
}

export function useNavigate() {
  const router = useRouter()
  return (to: string, options?: { replace?: boolean }) => {
    if (options?.replace) router.replace(to)
    else router.push(to)
  }
}

export function useLocation() {
  const pathname = usePathname() ?? '/'
  return { pathname, search: '', hash: '', state: null, key: 'default' }
}

export function Navigate({
  to,
  state,
  replace,
}: {
  to: string
  state?: { from?: { pathname?: string } } | null
  replace?: boolean
}) {
  const router = useRouter()
  const navigated = useRef(false)

  useEffect(() => {
    if (navigated.current) return
    navigated.current = true

    const from = state?.from?.pathname
    const url = from ? `${to}?from=${encodeURIComponent(from)}` : to
    if (replace) router.replace(url)
    else router.push(url)
  }, [to, state, replace, router])

  return null
}

function normalizePath(path: string) {
  if (!path) return '/'
  const withoutQuery = path.split('?')[0].split('#')[0]
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1)
  }
  return withoutQuery || '/'
}

function isPathActive(to: string, pathname: string) {
  const target = normalizePath(to)
  const current = normalizePath(pathname)
  if (target === '/') return current === '/'
  return current === target || current.startsWith(`${target}/`)
}
