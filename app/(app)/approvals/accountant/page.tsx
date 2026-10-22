import ProtectedRoute from '@/src/components/ProtectedRoute'
import AccountantApproval from '@/src/screens/approvals/AccountantApproval'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.ACCOUNTANT]}>
      <AccountantApproval />
    </ProtectedRoute>
  )
}
