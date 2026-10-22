import ProtectedRoute from '@/src/components/ProtectedRoute'
import BranchManagerApproval from '@/src/screens/approvals/BranchManagerApproval'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.BRANCH_MANAGER]}>
      <BranchManagerApproval />
    </ProtectedRoute>
  )
}
