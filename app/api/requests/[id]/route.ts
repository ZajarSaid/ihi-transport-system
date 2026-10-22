import { NextResponse } from 'next/server'
import { auth } from '@/src/auth'
import { prisma, TRANSACTION_OPTIONS } from '@/src/lib/prisma'
import { mapRequestFromDb, REQUEST_INCLUDE } from '@/src/lib/mappers'
import { storeSignature } from '@/src/lib/signatures'
import { REQUEST_STATUSES } from '@/src/utils/statusConfig'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await prisma.transportRequest.findUnique({
    where: { id },
    include: REQUEST_INCLUDE,
  })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(mapRequestFromDb(row))
}

/**
 * Edit a draft.
 *
 * Only the owner may edit, and only while the request is still a draft —
 * once it has been submitted the workflow owns it.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const role = (session?.user as any)?.role
    const userId = (session?.user as any)?.id

    const existing = await prisma.transportRequest.findUnique({
      where: { id },
      include: REQUEST_INCLUDE,
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (role !== 'admin' && existing.createdById !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (existing.status !== REQUEST_STATUSES.DRAFT) {
      return NextResponse.json(
        { error: 'Only draft requests can be edited.' },
        { status: 400 },
      )
    }

    const applicant = body.applicant || {}
    const trip = body.trip || {}
    const passengers = Array.isArray(body.passengers)
      ? body.passengers.filter((name: any) => typeof name === 'string' && name.trim())
      : []
    const declaration = body.applicantDeclaration || body.declaration || {}

    const applicantName = applicant.name ?? existing.applicantName
    const branchId = applicant.branch ?? existing.applicantBranchId
    const projectId = applicant.projectUnit ?? existing.applicantProjectId
    const costCenterId = applicant.costCenter ?? existing.applicantCostCenterId

    const [branch, project, costCenter] = await Promise.all([
      prisma.branch.findUnique({ where: { id: branchId } }),
      prisma.project.findUnique({ where: { id: projectId } }),
      prisma.costCenter.findUnique({ where: { id: costCenterId } }),
    ])
    if (!branch || !project || !costCenter) {
      return NextResponse.json(
        { error: 'Unknown branch, project or cost center.' },
        { status: 400 },
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      /**
       * The signature may be unchanged (the browser sends the stored one
       * back), newly attached, or a typed name.
       */
      let signatureId = existing.declaration?.signatureId ?? null
      let typedSignature = existing.declaration?.typedSignature ?? null
      const incoming = declaration.signature

      if (incoming === null) {
        signatureId = null
        typedSignature = null
      } else if (typeof incoming === 'string') {
        signatureId = null
        typedSignature = incoming.trim() || null
      } else if (incoming?.id && incoming.id === signatureId) {
        // unchanged
      } else if (incoming?.data) {
        const stored = await storeSignature(tx, id, incoming)
        if (stored) signatureId = stored
        typedSignature = null
      }

      await tx.passenger.deleteMany({ where: { requestId: id } })

      return tx.transportRequest.update({
        where: { id },
        data: {
          applicantName,
          applicantBranchId: branchId,
          applicantPhone: applicant.phone ?? existing.applicantPhone,
          applicantEmail: applicant.email ?? existing.applicantEmail,
          applicantProjectId: projectId,
          applicantCostCenterId: costCenterId,
          travelDate: trip.travelDate
            ? new Date(trip.travelDate)
            : existing.travelDate,
          departureTime: trip.departureTime ?? existing.departureTime,
          passengerCount:
            Number(trip.passengerCount) || passengers.length || existing.passengerCount,
          origin: trip.origin ?? existing.origin,
          destination: trip.destination ?? existing.destination,
          estimatedDuration: trip.estimatedDuration ?? existing.estimatedDuration,
          reason: trip.reason ?? existing.reason,
          passengers: {
            create: passengers.map((name: string, position: number) => ({ name, position })),
          },
          declaration: {
            upsert: {
              where: { requestId: id },
              create: {
                confirmed: !!declaration.confirmed,
                applicantName:
                  declaration.applicantName || existing.declaration?.applicantName || applicantName,
                date: declaration.date
                  ? new Date(declaration.date)
                  : new Date(),
                signatureId,
                typedSignature,
              },
              update: {
                confirmed: declaration.confirmed ?? existing.declaration?.confirmed ?? false,
                applicantName:
                  declaration.applicantName || existing.declaration?.applicantName || applicantName,
                date: declaration.date
                  ? new Date(declaration.date)
                  : existing.declaration?.date || new Date(),
                signatureId,
                typedSignature,
              },
            },
          },
        },
        include: REQUEST_INCLUDE,
      })
    }, TRANSACTION_OPTIONS)

    return NextResponse.json(mapRequestFromDb(updated))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}

/**
 * Delete a draft. Submitted requests are part of the audit trail and cannot
 * be removed.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const { id } = await params
    const role = (session?.user as any)?.role
    const userId = (session?.user as any)?.id

    const existing = await prisma.transportRequest.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (role !== 'admin' && existing.createdById !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (existing.status !== REQUEST_STATUSES.DRAFT) {
      return NextResponse.json(
        { error: 'Only draft requests can be deleted.' },
        { status: 400 },
      )
    }

    await prisma.transportRequest.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
