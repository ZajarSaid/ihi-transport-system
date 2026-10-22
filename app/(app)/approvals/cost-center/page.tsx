import ProtectedRoute from '@/src/components/ProtectedRoute'
import CostCenterApproval from '@/src/screens/approvals/CostCenterApproval'
import { ROLES } from '@/src/data/users'

export default function Page() {
  return (
    <ProtectedRoute roles={[ROLES.COST_CENTER]}>
      <CostCenterApproval />
    </ProtectedRoute>
  )
}
