import { auth } from '@/src/auth'
import { prisma, TRANSACTION_OPTIONS } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import { REQUEST_STATUSES } from '@/src/utils/statusConfig'
import { canSubmit } from '@/src/lib/workflow'
import { mapRequestFromDb, REQUEST_INCLUDE } from '@/src/lib/mappers'

export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const { id } = await params

    const request = await prisma.transportRequest.findUnique({
      where: { id },
      include: REQUEST_INCLUDE,
    })
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (session?.user?.id && request.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (request.status !== REQUEST_STATUSES.DRAFT) {
      return NextResponse.json({ error: 'Only draft requests can be submitted.' }, { status: 400 })
    }
    const mapped = mapRequestFromDb(request)
    if (!canSubmit(mapped)) {
      return NextResponse.json(
        { error: 'Attach your official signature (picture or PDF) to the declaration before submitting. Edit the request to add it.' },
        { status: 400 },
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.transportRequest.update({
        where: { id },
        data: { status: REQUEST_STATUSES.SUBMITTED, submittedAt: new Date() },
        include: REQUEST_INCLUDE,
      })
      await tx.auditLog.create({
        data: {
          requestId: id,
          action: 'Submitted',
          fromStatus: REQUEST_STATUSES.DRAFT,
          toStatus: REQUEST_STATUSES.SUBMITTED,
          actorId: session?.user?.id || request.createdById,
          actorName: session?.user?.name || request.createdByName,
          actorRole: (session?.user as any)?.role || null,
        },
      })
      return r
    }, TRANSACTION_OPTIONS)

    return NextResponse.json(mapRequestFromDb(updated))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
