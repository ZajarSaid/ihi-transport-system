import ProtectedRoute from '@/src/components/ProtectedRoute'
import RequestList from '@/src/screens/requests/RequestList'

export default function Page() {
  return (
    <ProtectedRoute>
      <RequestList />
    </ProtectedRoute>
  )
}
