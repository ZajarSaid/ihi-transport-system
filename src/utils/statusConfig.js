export const REQUEST_STATUSES = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING_COST_CENTER: 'Pending Cost Center Approval',
  COST_CENTER_REJECTED: 'Cost Center Rejected',
  PENDING_BRANCH_MANAGER: 'Pending Branch Manager Approval',
  BRANCH_MANAGER_REJECTED: 'Branch Manager Rejected',
  PENDING_FUNDS: 'Pending Funds Confirmation',
  FUNDS_NOT_AVAILABLE: 'Funds Not Available',
  PENDING_DRIVER_ASSIGNMENT: 'Pending Driver Assignment',
  READY_FOR_TRIP: 'Ready for Trip',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const WORKFLOW_STEPS = [
  { key: 'submitted', label: 'Request Submitted' },
  { key: 'costCenter', label: 'Head of Cost Center Approval' },
  { key: 'branchManager', label: 'Branch Manager Approval' },
  { key: 'accountant', label: 'Accountant Confirmation' },
  { key: 'reception', label: 'Driver Assignment (Receptionist)' },
  { key: 'ready', label: 'Ready for Trip & Print' },
]

export const REJECTION_STATUSES = [
  REQUEST_STATUSES.COST_CENTER_REJECTED,
  REQUEST_STATUSES.BRANCH_MANAGER_REJECTED,
  REQUEST_STATUSES.FUNDS_NOT_AVAILABLE,
  REQUEST_STATUSES.CANCELLED,
]

export const TERMINAL_STATUSES = [
  REQUEST_STATUSES.COST_CENTER_REJECTED,
  REQUEST_STATUSES.BRANCH_MANAGER_REJECTED,
  REQUEST_STATUSES.FUNDS_NOT_AVAILABLE,
  REQUEST_STATUSES.CANCELLED,
]

export const TRANSIT_STATUSES = [
  REQUEST_STATUSES.SUBMITTED,
  REQUEST_STATUSES.PENDING_COST_CENTER,
  REQUEST_STATUSES.PENDING_BRANCH_MANAGER,
  REQUEST_STATUSES.PENDING_FUNDS,
  REQUEST_STATUSES.PENDING_DRIVER_ASSIGNMENT,
  REQUEST_STATUSES.READY_FOR_TRIP,
]

export const ALL_STATUSES = Object.values(REQUEST_STATUSES)

export function statusBadgeVariant(status = '') {
  const s = String(status).toLowerCase()
  if (
    s.includes('draft') ||
    s.includes('pending') ||
    s.includes('submitted')
  ) {
    return 'pending'
  }
  if (
    s.includes('approve') ||
    s.includes('confirm') ||
    s.includes('allocat') ||
    s.includes('ready') ||
    s.includes('assigned')
  ) {
    return 'approved'
  }
  if (s.includes('reject') || s.includes('cancel') || s.includes('not avail')) {
    return 'rejected'
  }
  if (s.includes('complete')) return 'completed'
  return 'pending'
}

export function getWorkflowProgress(status) {
  const completedSteps = []
  const currentKey = currentWorkflowStep(status)
  const statusIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentKey)
  if (currentKey && statusIndex !== -1) {
    WORKFLOW_STEPS.slice(0, statusIndex + 1).forEach((s) =>
      completedSteps.push(s.key),
    )
  }
  return { currentKey, statusIndex, completedSteps }
}

export function currentWorkflowStep(status) {
  switch (status) {
    case REQUEST_STATUSES.SUBMITTED:
      return 'submitted'
    case REQUEST_STATUSES.PENDING_COST_CENTER:
      return 'costCenter'
    case REQUEST_STATUSES.PENDING_BRANCH_MANAGER:
      return 'branchManager'
    case REQUEST_STATUSES.PENDING_FUNDS:
      return 'accountant'
    case REQUEST_STATUSES.PENDING_DRIVER_ASSIGNMENT:
      return 'reception'
    case REQUEST_STATUSES.READY_FOR_TRIP:
    case REQUEST_STATUSES.COMPLETED:
      return 'ready'
    default:
      return null
  }
}
