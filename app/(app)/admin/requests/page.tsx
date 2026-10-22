import ProtectedRoute from '@/src/components/ProtectedRoute'
import AdminRequests from '@/src/screens/admin/AdminRequests'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.ADMIN]}>
      <AdminRequests />
    </ProtectedRoute>
  )
}
