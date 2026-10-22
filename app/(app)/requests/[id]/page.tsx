import ProtectedRoute from '@/src/components/ProtectedRoute'
import RequestDetail from '@/src/screens/requests/RequestDetail'

export default function Page() {
  return (
    <ProtectedRoute>
      <RequestDetail />
    </ProtectedRoute>
  )
}
