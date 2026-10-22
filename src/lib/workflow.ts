import { REQUEST_STATUSES } from '../utils/statusConfig'

export const ROLES = {
  APPLICANT: 'applicant',
  COST_CENTER: 'cost_center',
  BRANCH_MANAGER: 'branch_manager',
  ACCOUNTANT: 'accountant',
  RECEPTIONIST: 'receptionist',
  ADMIN: 'admin',
}

export const STAGE_TO_STATUS = {
  cost_center: REQUEST_STATUSES.PENDING_BRANCH_MANAGER,
  branch_manager: REQUEST_STATUSES.PENDING_FUNDS,
  accountant: REQUEST_STATUSES.PENDING_DRIVER_ASSIGNMENT,
}

export const REJECT_STATUS = {
  cost_center: REQUEST_STATUSES.COST_CENTER_REJECTED,
  branch_manager: REQUEST_STATUSES.BRANCH_MANAGER_REJECTED,
  accountant: REQUEST_STATUSES.FUNDS_NOT_AVAILABLE,
}

export const STAGE_BY_STATUS = {
  [REQUEST_STATUSES.SUBMITTED]: { stage: 'cost_center', role: ROLES.COST_CENTER },
  [REQUEST_STATUSES.PENDING_COST_CENTER]: { stage: 'cost_center', role: ROLES.COST_CENTER },
  [REQUEST_STATUSES.PENDING_BRANCH_MANAGER]: { stage: 'branch_manager', role: ROLES.BRANCH_MANAGER },
  [REQUEST_STATUSES.PENDING_FUNDS]: { stage: 'accountant', role: ROLES.ACCOUNTANT },
}

export const CAN_ASSIGN = {
  status: REQUEST_STATUSES.PENDING_DRIVER_ASSIGNMENT,
  role: ROLES.RECEPTIONIST,
}

export function isTerminal(status: any) {
  return [
    REQUEST_STATUSES.COST_CENTER_REJECTED,
    REQUEST_STATUSES.BRANCH_MANAGER_REJECTED,
    REQUEST_STATUSES.FUNDS_NOT_AVAILABLE,
    REQUEST_STATUSES.CANCELLED,
    REQUEST_STATUSES.COMPLETED,
  ].includes(status)
}

export function canSubmit(request: any) {
  if (!request) return false
  if (request.status !== REQUEST_STATUSES.DRAFT) return false
  const decl = request.applicantDeclaration
  if (!decl || decl.confirmed !== true) return false
  const sig = decl.signature
  if (!sig) return false
  // A typed name counts as a signature; a file carries its bytes.
  if (typeof sig === 'string') return sig.trim().length > 0
  if (sig.data) return true
  if (sig.id) return true
  return false
}
