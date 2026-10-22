import { auth } from '@/src/auth'
import { prisma, TRANSACTION_OPTIONS } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import { REQUEST_STATUSES } from '@/src/utils/statusConfig'
import { STAGE_TO_STATUS, REJECT_STATUS, ROLES } from '@/src/lib/workflow'
import { mapRequestFromDb, REQUEST_INCLUDE } from '@/src/lib/mappers'
import { storeSignature } from '@/src/lib/signatures'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const fundsAvailable = body.fundsAvailable === true || body.approved === true
    const comment = body.comment || ''
    const name = body.name || session?.user?.name || ''
    const signature = body.signature
    const project = body.project || null
    const costCenter = body.costCenter || null
    const branch = body.branch || null

    if (role !== ROLES.ACCOUNTANT && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!signature) {
      return NextResponse.json({ error: 'Your official signature (picture or PDF) is required to record this decision.' }, { status: 400 })
    }

    const request = await prisma.transportRequest.findUnique({ where: { id } })
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (request.status !== REQUEST_STATUSES.PENDING_FUNDS) {
      return NextResponse.json({ error: 'Only branch-manager-approved requests can be confirmed by the accountant.' }, { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const signatureId = await storeSignature(tx, id, signature)
      await tx.approval.create({
        data: {
          requestId: id,
          stage: 'accountant',
          approved: fundsAvailable,
          name,
          date: new Date(),
          comment,
          fundsAvailable,
          project,
          costCenter,
          branch,
          signatureId,
        },
      })
      const r = await tx.transportRequest.update({
        where: { id },
        data: {
          status: fundsAvailable ? STAGE_TO_STATUS.accountant : REJECT_STATUS.accountant,
        },
        include: REQUEST_INCLUDE,
      })
      await tx.auditLog.create({
        data: {
          requestId: id,
          action: fundsAvailable ? 'Funds Confirmed' : 'Funds Not Available',
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
