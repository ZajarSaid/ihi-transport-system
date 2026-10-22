import { auth } from '@/src/auth'
import { prisma, TRANSACTION_OPTIONS } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import { REQUEST_STATUSES } from '@/src/utils/statusConfig'
import { STAGE_BY_STATUS, STAGE_TO_STATUS, REJECT_STATUS, ROLES } from '@/src/lib/workflow'
import { mapRequestFromDb, REQUEST_INCLUDE } from '@/src/lib/mappers'
import { storeSignature } from '@/src/lib/signatures'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const approved = body.approved === true
    const comment = body.comment || ''
    const name = body.name || session?.user?.name || ''
    const signature = body.signature

    if (role !== ROLES.COST_CENTER && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!signature) {
      return NextResponse.json({ error: 'Your official signature (picture or PDF) is required to record this decision.' }, { status: 400 })
    }

    const request = await prisma.transportRequest.findUnique({ where: { id } })
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (request.status !== REQUEST_STATUSES.SUBMITTED && request.status !== REQUEST_STATUSES.PENDING_COST_CENTER) {
      return NextResponse.json({ error: 'Only submitted requests can be reviewed by the cost center.' }, { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const signatureId = await storeSignature(tx, id, signature)
      const approval = await tx.approval.create({
        data: {
          requestId: id,
          stage: 'cost_center',
          approved,
          name,
          date: new Date(),
          comment,
          signatureId,
        },
      })
      const r = await tx.transportRequest.update({
        where: { id },
        data: {
          status: approved ? STAGE_TO_STATUS.cost_center : REJECT_STATUS.cost_center,
        },
        include: REQUEST_INCLUDE,
      })
      await tx.auditLog.create({
        data: {
          requestId: id,
          action: approved ? 'Cost Center Approved' : 'Cost Center Rejected',
          fromStatus: request.status,
          toStatus: r.status,
          note: comment || null,
          actorId: session?.user?.id || null,
          actorName: name,
          actorRole: role || null,
        },
      })
      return r
    }, TRANSACTION_OPTIONS)

    return NextResponse.json(mapRequestFromDb(updated))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
