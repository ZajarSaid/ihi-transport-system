import 'dotenv/config'
import { hash } from 'bcryptjs'
import { prisma } from '../src/lib/prisma'
import { demoUsers, ROLES, type Role } from '../src/data/users'
import {
  branches,
  projects,
  costCenters,
} from '../src/data/referenceData'
import {
  vehicles,
  drivers,
  transportRates,
  transportInstructions,
} from '../src/data/fleetData'
import { seedRequests as seedRequestData } from '../src/data/seedRequests'

/**
 * Seed script.
 *
 * Everything it inserts comes from the files in `src/data/` — the same files
 * the localStorage build used — so the database starts life with exactly the
 * content the old app had in the browser.
 *
 * Run it with `npm run db:seed`. It is destructive: it clears the tables
 * first, so it can be re-run at any time to get back to a known state.
 */

const DEMO_PASSWORD = 'demo123'
const BCRYPT_ROUNDS = 10

type SeedApproval = {
  approved: boolean
  name: string
  date: string
  comment?: string
}

type SeedFundsConfirmation = SeedApproval & {
  fundsAvailable: boolean
  project?: string
  costCenter?: string
  branch?: string
}

type SeedAllocation = {
  vehicleId: string
  driverId: string
  vehicleName?: string
  driverName?: string
  instructions?: string
  date: string
  assignedBy: string
}

type SeedRequest = {
  id: string
  referenceNumber: string
  applicant: {
    name: string
    branch: string
    phone: string
    email: string
    projectUnit: string
    costCenter: string
  }
  trip: {
    travelDate: string
    departureTime: string
    passengerCount: number
    origin: string
    destination: string
    estimatedDuration: string
    reason: string
  }
  passengers: string[]
  applicantDeclaration: {
    confirmed: boolean
    applicantName: string
    date: string
    signature?: string
  }
  status: string
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName: string
  costCenterApproval?: SeedApproval
  branchManagerApproval?: SeedApproval
  fundsConfirmation?: SeedFundsConfirmation
  transportAllocation?: SeedAllocation
}

/**
 * The status each approval stage moves the request to. These strings are the
 * ones in REQUEST_STATUSES (src/utils/statusConfig.js) — they must match
 * byte for byte.
 */
const STAGE_TRANSITIONS: Record<
  string,
  { from: string; approvedTo: string; rejectedTo: string }
> = {
  cost_center: {
    from: 'Submitted',
    approvedTo: 'Pending Branch Manager Approval',
    rejectedTo: 'Cost Center Rejected',
  },
  branch_manager: {
    from: 'Pending Branch Manager Approval',
    approvedTo: 'Pending Funds Confirmation',
    rejectedTo: 'Branch Manager Rejected',
  },
  accountant: {
    from: 'Pending Funds Confirmation',
    approvedTo: 'Pending Driver Assignment',
    rejectedTo: 'Funds Not Available',
  },
}

/**
 * The four demo users who can act on a request. The seed approvals only
 * carry a job title ("Branch Manager"), so the audit trail is attributed to
 * the matching demo account instead.
 */
const STAGE_ACTORS: Record<
  string,
  { id: string; name: string; role: Role }
> = {
  cost_center: {
    id: 'u-cost-center',
    name: 'Dr. Amina Yusuf',
    role: ROLES.COST_CENTER,
  },
  branch_manager: {
    id: 'u-branch-manager',
    name: 'James Kariuki',
    role: ROLES.BRANCH_MANAGER,
  },
  accountant: {
    id: 'u-accountant',
    name: 'Grace Wanjiru',
    role: ROLES.ACCOUNTANT,
  },
  reception: {
    id: 'u-receptionist',
    name: 'Peter Otieno',
    role: ROLES.RECEPTIONIST,
  },
}

async function clearDatabase() {
  await prisma.auditLog.deleteMany()
  await prisma.approval.deleteMany()
  await prisma.transportAllocation.deleteMany()
  await prisma.applicantDeclaration.deleteMany()
  await prisma.passenger.deleteMany()
  await prisma.signature.deleteMany()
  await prisma.transportRequest.deleteMany()
  await prisma.referenceCounter.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.transportRate.deleteMany()
  await prisma.transportInstruction.deleteMany()
  await prisma.project.deleteMany()
  await prisma.costCenter.deleteMany()
  await prisma.branch.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()
}

async function seedReferenceData() {
  await prisma.branch.createMany({
    data: branches.map((branch) => ({ id: branch.id, name: branch.name })),
  })

  await prisma.costCenter.createMany({
    data: costCenters.map((id) => ({ id, name: null })),
  })

  await prisma.project.createMany({
    data: projects.map((project) => ({
      id: project.id,
      name: project.name,
      costCenterId: project.costCenter,
    })),
  })

  await prisma.transportRate.createMany({
    data: transportRates.map((rate, index) => ({
      vehicle: rate.vehicle,
      rate: rate.rate,
      sortOrder: index,
    })),
  })

  await prisma.transportInstruction.createMany({
    data: transportInstructions.map((text, index) => ({ text, sortOrder: index })),
  })
}

async function seedFleet() {
  await prisma.vehicle.createMany({
    data: vehicles.map((vehicle) => ({
      id: vehicle.id,
      registration: vehicle.registration,
      type: vehicle.type,
      capacity: vehicle.capacity,
      available: vehicle.available,
    })),
  })

  await prisma.driver.createMany({
    data: drivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      available: driver.available,
    })),
  })
}

async function seedUsers(requests: SeedRequest[]) {
  const passwordHash = await hash(DEMO_PASSWORD, BCRYPT_ROUNDS)

  const demo = demoUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash,
    role: user.role,
    title: user.title,
  }))

  /**
   * Three of the seeded requests were raised by people who are not in
   * `demoUsers`. They are real applicants, so they get real accounts with
   * the same demo password.
   */
  const known = new Set(demo.map((user) => user.id))
  const extra = requests
    .filter((request) => !known.has(request.createdBy))
    .map((request) => ({
      id: request.createdBy,
      name: request.createdByName,
      email: request.applicant.email,
      passwordHash,
      role: ROLES.APPLICANT,
      title: 'Transport Applicant',
    }))

  await prisma.user.createMany({ data: [...demo, ...extra] })

  return demo.length + extra.length
}

async function seedTransportRequests(requests: SeedRequest[]) {
  for (const request of requests) {
    await prisma.transportRequest.create({
      data: {
        id: request.id,
        referenceNumber: request.referenceNumber,
        status: request.status,
        submittedAt:
          request.status === 'Draft' ? null : new Date(request.createdAt),
        completedAt:
          request.status === 'Completed'
            ? new Date(request.updatedAt)
            : null,

        applicantName: request.applicant.name,
        applicantBranchId: request.applicant.branch,
        applicantPhone: request.applicant.phone,
        applicantEmail: request.applicant.email,
        applicantProjectId: request.applicant.projectUnit,
        applicantCostCenterId: request.applicant.costCenter,

        travelDate: new Date(request.trip.travelDate),
        departureTime: request.trip.departureTime,
        passengerCount: request.trip.passengerCount,
        origin: request.trip.origin,
        destination: request.trip.destination,
        estimatedDuration: request.trip.estimatedDuration,
        reason: request.trip.reason,

        createdById: request.createdBy,
        createdByName: request.createdByName,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.updatedAt),

        passengers: {
          create: request.passengers.map((name, position) => ({
            name,
            position,
          })),
        },

        declaration: {
          create: {
            confirmed: request.applicantDeclaration.confirmed,
            applicantName: request.applicantDeclaration.applicantName,
            date: new Date(request.applicantDeclaration.date),
            typedSignature: request.applicantDeclaration.signature ?? null,
          },
        },
      },
    })

    const approvals: {
      stage: string
      data: {
        approved: boolean
        name: string
        date: Date
        comment?: string
        fundsAvailable?: boolean
        project?: string
        costCenter?: string
        branch?: string
      }
    }[] = []

    if (request.costCenterApproval) {
      approvals.push({
        stage: 'cost_center',
        data: {
          approved: request.costCenterApproval.approved,
          name: request.costCenterApproval.name,
          date: new Date(request.costCenterApproval.date),
          comment: request.costCenterApproval.comment,
        },
      })
    }

    if (request.branchManagerApproval) {
      approvals.push({
        stage: 'branch_manager',
        data: {
          approved: request.branchManagerApproval.approved,
          name: request.branchManagerApproval.name,
          date: new Date(request.branchManagerApproval.date),
          comment: request.branchManagerApproval.comment,
        },
      })
    }

    if (request.fundsConfirmation) {
      approvals.push({
        stage: 'accountant',
        data: {
          approved: request.fundsConfirmation.fundsAvailable,
          name: request.fundsConfirmation.name,
          date: new Date(request.fundsConfirmation.date),
          comment: request.fundsConfirmation.comment,
          fundsAvailable: request.fundsConfirmation.fundsAvailable,
          project: request.fundsConfirmation.project,
          costCenter: request.fundsConfirmation.costCenter,
          branch: request.fundsConfirmation.branch,
        },
      })
    }

    for (const approval of approvals) {
      await prisma.approval.create({
        data: {
          requestId: request.id,
          stage: approval.stage,
          ...approval.data,
        },
      })
    }

    if (request.transportAllocation) {
      await prisma.transportAllocation.create({
        data: {
          requestId: request.id,
          vehicleId: request.transportAllocation.vehicleId,
          driverId: request.transportAllocation.driverId,
          vehicleName: request.transportAllocation.vehicleName,
          driverName: request.transportAllocation.driverName,
          instructions: request.transportAllocation.instructions,
          date: new Date(request.transportAllocation.date),
          assignedBy: request.transportAllocation.assignedBy,
        },
      })
    }

    await seedAuditTrail(request, approvals)
  }
}

/**
 * Reconstructs the audit trail from the blocks the seed data contains, so
 * that "show me the history of this request" already has an answer before
 * anyone has clicked anything.
 */
async function seedAuditTrail(
  request: SeedRequest,
  approvals: { stage: string; data: { approved: boolean } }[],
) {
  const entries: {
    action: string
    fromStatus: string | null
    toStatus: string
    actorId: string | null
    actorName: string
    actorRole: string
    note?: string
    createdAt: Date
  }[] = [
    {
      action: 'created',
      fromStatus: null,
      toStatus: 'Draft',
      actorId: request.createdBy,
      actorName: request.createdByName,
      actorRole: ROLES.APPLICANT,
      createdAt: new Date(request.createdAt),
    },
  ]

  if (request.status !== 'Draft') {
    entries.push({
      action: 'submitted',
      fromStatus: 'Draft',
      toStatus: 'Submitted',
      actorId: request.createdBy,
      actorName: request.createdByName,
      actorRole: ROLES.APPLICANT,
      createdAt: new Date(request.createdAt),
    })
  }

  for (const approval of approvals) {
    const actor = STAGE_ACTORS[approval.stage]
    const step = STAGE_TRANSITIONS[approval.stage]
    entries.push({
      action: `${approval.stage}_decision`,
      fromStatus: step.from,
      toStatus: approval.data.approved ? step.approvedTo : step.rejectedTo,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      createdAt: new Date(request.updatedAt),
    })
  }

  if (request.transportAllocation) {
    entries.push({
      action: 'allocation',
      fromStatus: 'Pending Driver Assignment',
      toStatus: 'Ready for Trip',
      actorId: STAGE_ACTORS.reception.id,
      actorName: STAGE_ACTORS.reception.name,
      actorRole: STAGE_ACTORS.reception.role,
      note: request.transportAllocation.instructions,
      createdAt: new Date(request.transportAllocation.date),
    })
  }

  for (const entry of entries) {
    await prisma.auditLog.create({
      data: {
        requestId: request.id,
        action: entry.action,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        actorId: entry.actorId,
        actorName: entry.actorName,
        actorRole: entry.actorRole,
        note: entry.note,
        createdAt: entry.createdAt,
      },
    })
  }
}

async function seedReferenceCounter(requests: SeedRequest[]) {
  const byYear = new Map<number, number>()

  for (const request of requests) {
    const match = /^TR-(\d{4})-(\d+)$/.exec(request.referenceNumber)
    if (!match) continue
    const year = Number(match[1])
    const sequence = Number(match[2])
    byYear.set(year, Math.max(byYear.get(year) ?? 0, sequence))
  }

  await prisma.referenceCounter.createMany({
    data: [...byYear.entries()].map(([year, lastValue]) => ({
      id: String(year),
      year,
      lastValue,
    })),
  })
}

async function main() {
  const requests = seedRequestData as unknown as SeedRequest[]

  console.log('Clearing existing data...')
  await clearDatabase()

  console.log('Seeding reference data...')
  await seedReferenceData()

  console.log('Seeding fleet...')
  await seedFleet()

  console.log('Seeding users...')
  const userCount = await seedUsers(requests)

  console.log('Seeding transport requests...')
  await seedTransportRequests(requests)

  console.log('Seeding reference counters...')
  await seedReferenceCounter(requests)

  console.log(
    `Done. ${userCount} users, ${branches.length} branches, ` +
      `${projects.length} projects, ${vehicles.length} vehicles, ` +
      `${drivers.length} drivers, ${requests.length} requests.`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
