import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { auth } from '@/src/auth'
import {
  canManageFleet,
  isUniqueViolation,
  readDriverInput,
} from '@/src/lib/fleet'

export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Context) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    if (!canManageFleet(role)) {
      return NextResponse.json(
        { error: 'Only reception staff can manage the fleet.' },
        { status: 403 },
      )
    }

    const { id } = await params
    const existing = await prisma.driver.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Driver not found.' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({}))
    const { data, errors } = readDriverInput(body, true)
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 })
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
    }

    try {
      const updated = await prisma.driver.update({ where: { id }, data })
      return NextResponse.json(updated)
    } catch (error) {
      if (isUniqueViolation(error)) {
        return NextResponse.json(
          { error: 'A driver with this email address already exists.' },
          { status: 409 },
        )
      }
      throw error
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: Context) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    if (!canManageFleet(role)) {
      return NextResponse.json(
        { error: 'Only reception staff can manage the fleet.' },
        { status: 403 },
      )
    }

    const { id } = await params
    const existing = await prisma.driver.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Driver not found.' }, { status: 404 })
    }

    /**
     * Trips that already used this driver keep their own record: the
     * allocation stores the driver name as it was at the time, and the link
     * to the driver is cleared rather than cascading the delete.
     */
    await prisma.transportAllocation.updateMany({
      where: { driverId: id },
      data: { driverId: null },
    })

    await prisma.driver.delete({ where: { id } })
    return NextResponse.json({ id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
