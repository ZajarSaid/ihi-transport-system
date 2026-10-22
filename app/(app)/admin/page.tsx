import ProtectedRoute from '@/src/components/ProtectedRoute'
import AdminDashboard from '@/src/screens/admin/AdminDashboard'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.ADMIN]}>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
