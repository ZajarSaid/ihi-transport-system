import ProtectedRoute from '@/src/components/ProtectedRoute'
import DriverList from '@/src/screens/transport/DriverList'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.RECEPTIONIST]}>
      <DriverList />
    </ProtectedRoute>
  )
}
