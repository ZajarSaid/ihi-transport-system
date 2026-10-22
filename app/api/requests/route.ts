import { auth } from '@/src/auth'
import { prisma, TRANSACTION_OPTIONS } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import { REQUEST_STATUSES } from '@/src/utils/statusConfig'
import { mapRequestFromDb, REQUEST_INCLUDE } from '@/src/lib/mappers'
import { storeSignature } from '@/src/lib/signatures'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

function generateId() {
  return `req-${Date.now()}-${randomUUID().slice(0, 8)}`
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) where.status = status
    const role = (session?.user as any)?.role
    const userId = (session?.user as any)?.id
    if (role === 'applicant') where.createdById = userId

    const rows = await prisma.transportRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: REQUEST_INCLUDE,
    })

    return NextResponse.json(rows.map(mapRequestFromDb))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const body = await req.json().catch(() => ({}))

    const applicant = body.applicant || {}
    const trip = body.trip || {}
    const passengers = Array.isArray(body.passengers) ? body.passengers.filter(Boolean) : []
    const declaration = body.applicantDeclaration || body.declaration || {}

    const id = body.id || generateId()
    const createdById = body.createdBy || session?.user?.id || 'u-applicant'
    const createdByName = body.createdByName || session?.user?.name || applicant.name || ''

    const year = new Date().getFullYear()
    const last = await prisma.transportRequest.findFirst({
      where: { referenceNumber: { startsWith: `TR-${year}-` } },
      orderBy: { referenceNumber: 'desc' },
      select: { referenceNumber: true },
    })
    let n = 1
    if (last?.referenceNumber) {
      const parts = last.referenceNumber.split('-')
      const m = parseInt(parts[2] || '0', 10)
      if (!isNaN(m)) n = m + 1
    }
    const referenceNumber = `TR-${year}-${String(n).padStart(4, '0')}`

    await prisma.$transaction(async (tx) => {
      const created = await tx.transportRequest.create({
        data: {
          id,
          referenceNumber,
          status: REQUEST_STATUSES.DRAFT,
          applicantName: applicant.name || '',
          applicantBranchId: applicant.branch || '',
          applicantPhone: applicant.phone || '',
          applicantEmail: applicant.email || '',
          applicantProjectId: applicant.projectUnit || applicant.projectId || '',
          applicantCostCenterId: applicant.costCenter || applicant.costCenterId || '',
          travelDate: trip.travelDate ? new Date(trip.travelDate) : new Date(),
          departureTime: trip.departureTime || '',
          passengerCount: Number(trip.passengerCount) || passengers.length || 1,
          origin: trip.origin || '',
          destination: trip.destination || '',
          estimatedDuration: trip.estimatedDuration || '',
          reason: trip.reason || '',
          createdById,
          createdByName,
          passengers: {
            create: passengers.map((name: string, position: number) => ({ name, position })),
          },
          declaration: {
            create: {
              confirmed: !!declaration.confirmed,
              applicantName: declaration.applicantName || applicant.name || '',
              date: declaration.date ? new Date(declaration.date) : new Date(),
            },
          },
        },
      })

      /**
       * The signature arrives as a data URL. It is stored as real bytes in the
       * Signature table and linked to the declaration, because the submit
       * endpoint refuses to submit a request without one.
       */
      const signatureId = await storeSignature(tx, id, declaration.signature)
      if (signatureId) {
        await tx.applicantDeclaration.update({
          where: { requestId: id },
          data: { signatureId },
        })
      } else if (typeof declaration.signature === 'string' && declaration.signature.trim()) {
        await tx.applicantDeclaration.update({
          where: { requestId: id },
          data: { typedSignature: declaration.signature.trim() },
        })
      }

      await tx.auditLog.create({
        data: {
          requestId: id,
          action: 'Created',
          toStatus: REQUEST_STATUSES.DRAFT,
          actorId: createdById,
          actorName: createdByName,
          actorRole: (session?.user as any)?.role || null,
        },
      })

      return id
    }, TRANSACTION_OPTIONS)

    const row = await prisma.transportRequest.findUnique({
      where: { id },
      include: REQUEST_INCLUDE,
    })

    return NextResponse.json(mapRequestFromDb(row), { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
