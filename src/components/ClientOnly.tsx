'use client'

import { useSyncExternalStore, type ReactNode } from 'react'

/**
 * Renders its children only in the browser.
 *
 * Phase 1 still reads every record from localStorage, so the server has no
 * idea what the page looks like. Rendering on the server would produce
 * markup that disagrees with the client and trip hydration errors, so the
 * tree is mounted client-side only — exactly like the original Vite SPA.
 */
export default function ClientOnly({
  children,
  fallback = null,
}: {
  children?: ReactNode
  fallback?: ReactNode
}) {
  const isClient = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  if (!isClient) return <>{fallback}</>

  return <>{children}</>
}

/**
 * The subscription never fires — the client-ness of the environment never
 * changes while the page is open — but React still needs one.
 */
function subscribe() {
  return () => {}
}

function getSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}
