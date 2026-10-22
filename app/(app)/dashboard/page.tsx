import ProtectedRoute from '@/src/components/ProtectedRoute'
import Home from '@/src/screens/Home'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.APPLICANT]}>
      <Home />
    </ProtectedRoute>
  )
}
