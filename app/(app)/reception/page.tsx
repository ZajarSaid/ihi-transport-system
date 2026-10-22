import ProtectedRoute from '@/src/components/ProtectedRoute'
import ReceptionDashboard from '@/src/screens/reception/ReceptionDashboard'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.RECEPTIONIST]}>
      <ReceptionDashboard />
    </ProtectedRoute>
  )
}
