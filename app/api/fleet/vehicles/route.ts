import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { auth } from '@/src/auth'
import {
  canManageFleet,
  isUniqueViolation,
  nextFleetId,
  readVehicleInput,
} from '@/src/lib/fleet'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await prisma.vehicle.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    if (!canManageFleet(role)) {
      return NextResponse.json(
        { error: 'Only reception staff can manage the fleet.' },
        { status: 403 },
      )
    }

    const body = await req.json().catch(() => ({}))
    const { data, errors } = readVehicleInput(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 })
    }

    const id = await nextFleetId('V')

    try {
      const created = await prisma.vehicle.create({
        data: {
          id,
          registration: data.registration!,
          type: data.type!,
          capacity: data.capacity!,
          available: data.available !== false,
        },
      })
      return NextResponse.json(created, { status: 201 })
    } catch (error) {
      if (isUniqueViolation(error)) {
        return NextResponse.json(
          { error: 'A vehicle with this registration already exists.' },
          { status: 409 },
        )
      }
      throw error
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
