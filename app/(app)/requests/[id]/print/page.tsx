import ProtectedRoute from '@/src/components/ProtectedRoute'
import PrintRequest from '@/src/screens/requests/PrintRequest'

export default function Page() {
  return (
    <ProtectedRoute>
      <PrintRequest />
    </ProtectedRoute>
  )
}
