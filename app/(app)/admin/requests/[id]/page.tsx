import ProtectedRoute from '@/src/components/ProtectedRoute'
import AdminRequestDetail from '@/src/screens/admin/AdminRequestDetail'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.ADMIN]}>
      <AdminRequestDetail />
    </ProtectedRoute>
  )
}
