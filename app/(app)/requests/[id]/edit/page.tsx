import ProtectedRoute from '@/src/components/ProtectedRoute'
import EditRequest from '@/src/screens/requests/EditRequest'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.APPLICANT]}>
      <EditRequest />
    </ProtectedRoute>
  )
}
