import ClientOnly from '@/src/components/ClientOnly'
import ProtectedRoute from '@/src/components/ProtectedRoute'
import MainLayout from '@/src/layouts/MainLayout'

/**
 * Every page in this segment reads from localStorage during render (Phase 1
 * still uses the browser store), so it must not be prerendered — otherwise
 * the server HTML and the client render disagree.
 */
export const dynamic = 'force-dynamic'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly>
      <ProtectedRoute>
        <MainLayout>{children}</MainLayout>
      </ProtectedRoute>
    </ClientOnly>
  )
}
