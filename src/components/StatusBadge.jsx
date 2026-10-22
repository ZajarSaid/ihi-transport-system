import { statusBadgeVariant } from '../utils/statusConfig'

function StatusBadge({ status, variant }) {
  const className = variant || statusBadgeVariant(status)
  return <span className={`badge badge-${className}`}>{status}</span>
}

export default StatusBadge