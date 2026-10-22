import { Suspense } from 'react'
import ClientOnly from '@/src/components/ClientOnly'
import Login from '@/src/screens/auth/Login'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <Login />
      </Suspense>
    </ClientOnly>
  )
}
