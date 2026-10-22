import ProtectedRoute from '@/src/components/ProtectedRoute'
import VehicleList from '@/src/screens/transport/VehicleList'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.RECEPTIONIST]}>
      <VehicleList />
    </ProtectedRoute>
  )
}
