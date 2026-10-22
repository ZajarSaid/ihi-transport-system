import { auth } from '@/src/auth'
import { prisma, TRANSACTION_OPTIONS } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import { REQUEST_STATUSES } from '@/src/utils/statusConfig'
import { ROLES } from '@/src/lib/workflow'
import { mapRequestFromDb, REQUEST_INCLUDE } from '@/src/lib/mappers'

export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    const { id } = await params

    if (role !== ROLES.RECEPTIONIST && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const request = await prisma.transportRequest.findUnique({ where: { id } })
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (request.status !== REQUEST_STATUSES.READY_FOR_TRIP) {
      return NextResponse.json({ error: 'Only ready requests can be marked as completed.' }, { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.transportRequest.update({
        where: { id },
        data: { status: REQUEST_STATUSES.COMPLETED, completedAt: new Date() },
        include: REQUEST_INCLUDE,
      })
      await tx.auditLog.create({
        data: {
          requestId: id,
          action: 'Completed',
          fromStatus: request.status,
          toStatus: r.status,
          actorId: session?.user?.id || null,
          actorName: session?.user?.name || null,
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
