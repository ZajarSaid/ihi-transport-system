import ProtectedRoute from '@/src/components/ProtectedRoute'
import RequestStatus from '@/src/screens/requests/RequestStatus'

export default function Page() {
  return (
    <ProtectedRoute>
      <RequestStatus />
    </ProtectedRoute>
  )
}
