import {
  loadRequests,
  saveRequests,
  clearRequests,
  hasEmptyMarker,
} from '../utils/storage'
import { seedRequests } from '../data/seedRequests'

export function getRequests() {
  let requests = loadRequests()
  if (requests.length === 0 && !hasEmptyMarker()) {
    saveRequests(seedRequests)
    requests = seedRequests
  }
  return requests
}

export function getRequestById(id) {
  return getRequests().find((req) => req.id === id) || null
}

export function getRequestByReference(referenceNumber) {
  return (
    getRequests().find((req) => req.referenceNumber === referenceNumber) || null
  )
}

export function createRequest(requestData) {
  const requests = getRequests()
  const newRequest = {
    ...requestData,
    id: requestData.id || generateId(),
  }
  requests.push(newRequest)
  if (!saveRequests(requests)) {
    throw new Error(
      'Could not save the request: browser storage is full. Try a smaller signature file.',
    )
  }
  return newRequest
}

export function updateRequest(id, updates) {
  const requests = getRequests()
  const index = requests.findIndex((req) => req.id === id)
  if (index === -1) return null
  const updated = {
    ...requests[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  requests[index] = updated
  if (!saveRequests(requests)) {
    throw new Error(
      'Could not save the changes: browser storage is full. Try a smaller signature file.',
    )
  }
  return updated
}

export function updateRequestStatus(id, status) {
  const updated = updateRequest(id, { status })
  return updated
}

export function submitRequest(id) {
  const request = getRequestById(id)
  if (!request) return null
  if (request.status !== 'Draft') {
    throw new Error('Only draft requests can be submitted.')
  }
  const signature = request.applicantDeclaration?.signature
  if (!signature || typeof signature === 'string' || !signature.data) {
    throw new Error(
      'Attach your official signature (picture or PDF) to the declaration before submitting. Edit the request to add it.',
    )
  }
  const updated = updateRequest(id, {
    status: 'Submitted',
    submittedAt: new Date().toISOString(),
  })
  return updated
}

export function setCostCenterApproval(id, approval) {
  const request = getRequestById(id)
  if (!request) return null
  if (request.status !== 'Submitted') {
    throw new Error('Only submitted requests can be reviewed by the cost center.')
  }
  if (!approval?.signature) {
    throw new Error(
      'Your official signature (picture or PDF) is required to record this decision.',
    )
  }
  const updated = updateRequest(id, {
    costCenterApproval: approval,
    status: approval.approved
      ? 'Pending Branch Manager Approval'
      : 'Cost Center Rejected',
  })
  return updated
}

export function setBranchManagerApproval(id, approval) {
  const request = getRequestById(id)
  if (!request) return null
  if (request.status !== 'Pending Branch Manager Approval') {
    throw new Error('Only cost-center-approved requests can go to the branch manager.')
  }
  if (!approval?.signature) {
    throw new Error(
      'Your official signature (picture or PDF) is required to record this decision.',
    )
  }
  const updated = updateRequest(id, {
    branchManagerApproval: approval,
    status: approval.approved
      ? 'Pending Funds Confirmation'
      : 'Branch Manager Rejected',
  })
  return updated
}

export function setFundsConfirmation(id, confirmation) {
  const request = getRequestById(id)
  if (!request) return null
  if (request.status !== 'Pending Funds Confirmation') {
    throw new Error('Only branch-manager-approved requests can be confirmed by the accountant.')
  }
  if (!confirmation?.signature) {
    throw new Error(
      'Your official signature (picture or PDF) is required to record this decision.',
    )
  }
  const updated = updateRequest(id, {
    fundsConfirmation: confirmation,
    status: confirmation.fundsAvailable
      ? 'Pending Driver Assignment'
      : 'Funds Not Available',
  })
  return updated
}

export function assignDrivers(id, allocation) {
  const request = getRequestById(id)
  if (!request) return null
  if (request.status !== 'Pending Driver Assignment') {
    throw new Error('Only requests with confirmed funds can be assigned drivers.')
  }
  if (!allocation.vehicleId || !allocation.driverId) {
    throw new Error('Vehicle and driver are required for assignment.')
  }
  if (!allocation.signature) {
    throw new Error(
      'Your official signature (picture or PDF) is required to complete the assignment.',
    )
  }
  const updated = updateRequest(id, {
    transportAllocation: allocation,
    status: 'Ready for Trip',
  })
  return updated
}

export function markCompleted(id) {
  const request = getRequestById(id)
  if (!request) return null
  if (request.status !== 'Ready for Trip') {
    throw new Error('Only ready requests can be marked as completed.')
  }
  return updateRequest(id, {
    status: 'Completed',
    completedAt: new Date().toISOString(),
  })
}

export function deleteRequest(id) {
  const requests = getRequests().filter((req) => req.id !== id)
  saveRequests(requests)
  return true
}

export function deleteRequestsByOwner(ownerId) {
  const requests = getRequests().filter((req) => req.createdBy !== ownerId)
  saveRequests(requests)
  return true
}

export function resetRequests() {
  clearRequests()
  saveRequests([])
  return []
}

function generateId() {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
