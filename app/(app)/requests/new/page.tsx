import ProtectedRoute from '@/src/components/ProtectedRoute'
import NewRequest from '@/src/screens/requests/NewRequest'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.APPLICANT]}>
      <NewRequest />
    </ProtectedRoute>
  )
}
