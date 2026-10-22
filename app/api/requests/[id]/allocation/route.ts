import { auth } from '@/src/auth'
import { prisma, TRANSACTION_OPTIONS } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import { REQUEST_STATUSES } from '@/src/utils/statusConfig'
import { ROLES } from '@/src/lib/workflow'
import { mapRequestFromDb, REQUEST_INCLUDE } from '@/src/lib/mappers'
import { storeSignature } from '@/src/lib/signatures'
import { sendDriverAssignmentEmail } from '@/src/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const vehicleId = body.vehicleId
    const driverId = body.driverId
    const instructions = body.instructions || ''
    const signature = body.signature

    if (role !== ROLES.RECEPTIONIST && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!vehicleId || !driverId) {
      return NextResponse.json({ error: 'Vehicle and driver are required for assignment.' }, { status: 400 })
    }
    if (!signature) {
      return NextResponse.json({ error: 'Your official signature (picture or PDF) is required to complete the assignment.' }, { status: 400 })
    }

    const request = await prisma.transportRequest.findUnique({ where: { id } })
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (request.status !== REQUEST_STATUSES.PENDING_DRIVER_ASSIGNMENT) {
      return NextResponse.json({ error: 'Only requests with confirmed funds can be assigned drivers.' }, { status: 400 })
    }

    /**
     * The allocation points at a Vehicle and a Driver row, so both have to be
     * in the fleet and free to take the trip. Checking here turns a stale
     * selection into a readable message instead of a foreign-key error.
     */
    const [vehicle, driver] = await Promise.all([
      prisma.vehicle.findUnique({ where: { id: vehicleId } }),
      prisma.driver.findUnique({ where: { id: driverId } }),
    ])
    if (!vehicle) {
      return NextResponse.json({ error: 'The selected vehicle is no longer in the fleet.' }, { status: 400 })
    }
    if (!driver) {
      return NextResponse.json({ error: 'The selected driver is no longer in the fleet.' }, { status: 400 })
    }
    if (!vehicle.available || !driver.available) {
      return NextResponse.json({ error: 'The selected vehicle or driver is not available.' }, { status: 400 })
    }
    if (vehicle.capacity < request.passengerCount) {
      return NextResponse.json(
        { error: `${vehicle.type} · ${vehicle.registration} cannot carry ${request.passengerCount} passengers.` },
        { status: 400 },
      )
    }

    /**
     * Snapshot the human-readable names and the driver's contact details on
     * the allocation. The printed transport form reads these, and they must
     * stay valid even if a vehicle/driver is edited or removed later.
     */
    const vehicleLabel = `${vehicle.type} · ${vehicle.registration}`
    const driverLabel = driver.name
    const assignedBy = session?.user?.name || 'Receptionist'
    const travelDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(request.travelDate)

    const updated = await prisma.$transaction(async (tx) => {
      const signatureId = await storeSignature(tx, id, signature)
      await tx.transportAllocation.create({
        data: {
          requestId: id,
          vehicleId,
          driverId,
          date: new Date(),
          assignedBy,
          instructions,
          vehicleName: vehicleLabel,
          driverName: driverLabel,
          driverPhone: driver.phone,
          driverEmail: driver.email,
          signatureId,
        },
      })
      const r = await tx.transportRequest.update({
        where: { id },
        data: { status: REQUEST_STATUSES.READY_FOR_TRIP },
        include: REQUEST_INCLUDE,
      })
      await tx.auditLog.create({
        data: {
          requestId: id,
          action: 'Driver Assigned',
          fromStatus: request.status,
          toStatus: r.status,
          note: instructions || null,
          actorId: session?.user?.id || null,
          actorName: assignedBy,
          actorRole: role || null,
        },
      })
      return r
    }, TRANSACTION_OPTIONS)

    /**
     * The allocation is already committed, so an email failure must not roll
     * it back or surface as an error. The helper logs and returns a result.
     */
    await sendDriverAssignmentEmail({
      to: driver.email,
      driverName: driverLabel,
      referenceNumber: request.referenceNumber,
      applicantName: request.applicantName,
      travelDate,
      departureTime: request.departureTime,
      origin: request.origin,
      destination: request.destination,
      passengerCount: request.passengerCount,
      vehicleName: vehicleLabel,
      instructions: instructions || null,
      assignedBy,
    })

    return NextResponse.json(mapRequestFromDb(updated))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
