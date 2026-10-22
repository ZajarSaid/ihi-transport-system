/**
 * Map a Prisma TransportRequest (with relations) into the shape the
 * existing React screens expect. Phase 1 reads localStorage objects whose
 * shape lives in src/data/seedRequests.js; every consumer uses those keys,
 * so the API must return the same keys.
 */

import { REQUEST_STATUSES } from '../utils/statusConfig'
import { mapSignature } from './signatures'

/**
 * Every read of a request needs the same relations: the screens render the
 * passenger list, the declaration, the approval trail and the allocation, and
 * each of them can carry a signature.
 */
export const REQUEST_INCLUDE = {
  passengers: true,
  declaration: { include: { signature: true } },
  approvals: { include: { signature: true } },
  allocation: { include: { signature: true } },
  branch: true,
  project: true,
  costCenter: true,
}

function toIso(d: any) {
  if (!d) return null
  if (d instanceof Date) return d.toISOString()
  return d
}

function toDateOnly(d: any) {
  if (!d) return ''
  if (d instanceof Date) return d.toISOString().slice(0, 10)
  if (typeof d === 'string') return d.slice(0, 10)
  return ''
}

export function mapRequestFromDb(row: any) {
  if (!row) return null

  const passengers = Array.isArray(row.passengers)
    ? row.passengers
        .slice()
        .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
        .map((p: any) => p.name)
    : []

  const approvals = Array.isArray(row.approvals) ? row.approvals : []
  const ca = approvals.find((a: any) => a.stage === 'cost_center')
  const costCenterApproval = ca
    ? {
        approved: ca.approved,
        name: ca.name,
        date: toIso(ca.date),
        comment: ca.comment || '',
        signature: mapSignature(ca.signature),
      }
    : undefined

  const ba = approvals.find((a: any) => a.stage === 'branch_manager')
  const branchManagerApproval = ba
    ? {
        approved: ba.approved,
        name: ba.name,
        date: toIso(ba.date),
        comment: ba.comment || '',
        signature: mapSignature(ba.signature),
      }
    : undefined

  const aa = approvals.find((a: any) => a.stage === 'accountant')
  const fundsConfirmation = aa
    ? {
        fundsAvailable: aa.approved,
        name: aa.name,
        date: toIso(aa.date),
        comment: aa.comment || '',
        project: row.project?.name || undefined,
        costCenter: row.costCenter?.id || row.applicantCostCenterId || undefined,
        branch: row.branch?.name || undefined,
        signature: mapSignature(aa.signature),
      }
    : undefined

  const allocation = row.allocation
    ? {
        vehicleId: row.allocation.vehicleId,
        driverId: row.allocation.driverId,
        vehicleName: row.allocation.vehicleName,
        driverName: row.allocation.driverName,
        driverPhone: row.allocation.driverPhone,
        driverEmail: row.allocation.driverEmail,
        instructions: row.allocation.instructions || '',
        date: toIso(row.allocation.date),
        assignedBy: row.allocation.assignedBy || undefined,
        signature: mapSignature(row.allocation.signature),
      }
    : undefined

  return {
    id: row.id,
    referenceNumber: row.referenceNumber,
    applicant: {
      name: row.applicantName,
      branch: row.applicantBranchId,
      phone: row.applicantPhone,
      email: row.applicantEmail,
      projectUnit: row.applicantProjectId,
      costCenter: row.applicantCostCenterId,
    },
    trip: {
      travelDate: toDateOnly(row.travelDate),
      departureTime: row.departureTime,
      passengerCount: row.passengerCount,
      origin: row.origin,
      destination: row.destination,
      estimatedDuration: row.estimatedDuration,
      reason: row.reason,
    },
    passengers,
    applicantDeclaration: row.declaration
      ? {
          confirmed: row.declaration.confirmed,
          applicantName: row.declaration.applicantName,
          date: toDateOnly(row.declaration.date),
          signature:
            mapSignature(row.declaration.signature) ??
            row.declaration.typedSignature ??
            undefined,
        }
      : undefined,
    status: row.status,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    submittedAt: toIso(row.submittedAt),
    completedAt: toIso(row.completedAt),
    createdBy: row.createdById,
    createdByName: row.createdByName,
    costCenterApproval,
    branchManagerApproval,
    fundsConfirmation,
    transportAllocation: allocation,
  }
}

export const REQUEST_STATUSES_OUT = REQUEST_STATUSES
