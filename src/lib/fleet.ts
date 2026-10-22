import { prisma } from './prisma'
import { ROLES } from './workflow'

/**
 * Shared rules for the fleet endpoints (vehicles and drivers).
 *
 * The fleet is written by reception and by an administrator. Every other role
 * only reads it: the allocation screen needs the list of vehicles and drivers
 * but must not be able to change it.
 */
export function canManageFleet(role?: string | null): boolean {
  return role === ROLES.RECEPTIONIST || role === ROLES.ADMIN
}

/**
 * Fleet ids are printed on the transport form, so they stay human-readable —
 * V001, D006. The next id is the highest number already in use plus one.
 */
export async function nextFleetId(prefix: 'V' | 'D'): Promise<string> {
  const rows =
    prefix === 'V'
      ? await prisma.vehicle.findMany({ select: { id: true } })
      : await prisma.driver.findMany({ select: { id: true } })

  const highest = rows.reduce((acc, row) => {
    const match = row.id.match(new RegExp(`^${prefix}(\\d+)$`))
    return match ? Math.max(acc, Number(match[1])) : acc
  }, 0)

  return `${prefix}${String(highest + 1).padStart(3, '0')}`
}

/**
 * Prisma reports a unique-constraint clash as P2002. The screens show the
 * message as-is, so it has to read like something a receptionist can act on
 * rather than a database error.
 */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'P2002'
  )
}

export type VehicleInput = {
  registration?: string
  type?: string
  capacity?: number
  available?: boolean
}

export type DriverInput = {
  name?: string
  phone?: string
  email?: string
  available?: boolean
}

/**
 * Read a vehicle out of a request body. With `partial` set, only the fields
 * that are actually present are validated and returned, so a PATCH can move
 * one field without demanding the whole record.
 */
export function readVehicleInput(
  body: any,
  partial = false,
): { data: VehicleInput; errors: string[] } {
  const data: VehicleInput = {}
  const errors: string[] = []

  if (!partial || body.registration !== undefined) {
    const registration = String(body.registration ?? '').trim()
    if (!registration) errors.push('Vehicle registration is required.')
    else data.registration = registration
  }

  if (!partial || body.type !== undefined) {
    const type = String(body.type ?? '').trim()
    if (!type) errors.push('Vehicle type is required.')
    else data.type = type
  }

  if (!partial || body.capacity !== undefined) {
    const capacity = Number(body.capacity)
    if (!Number.isInteger(capacity) || capacity < 1) {
      errors.push('Capacity must be at least 1 seat.')
    } else {
      data.capacity = capacity
    }
  }

  if (body.available !== undefined) {
    data.available = body.available !== false
  }

  return { data, errors }
}

/**
 * Read a driver out of a request body. `email` is required because the
 * database holds it as a unique column.
 */
export function readDriverInput(
  body: any,
  partial = false,
): { data: DriverInput; errors: string[] } {
  const data: DriverInput = {}
  const errors: string[] = []

  if (!partial || body.name !== undefined) {
    const name = String(body.name ?? '').trim()
    if (!name) errors.push('Driver name is required.')
    else data.name = name
  }

  if (!partial || body.phone !== undefined) {
    const phone = String(body.phone ?? '').trim()
    if (!phone) errors.push('Driver phone number is required.')
    else data.phone = phone
  }

  if (!partial || body.email !== undefined) {
    const email = String(body.email ?? '').trim().toLowerCase()
    if (!email) errors.push('Driver email address is required.')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Enter a valid email address.')
    } else {
      data.email = email
    }
  }

  if (body.available !== undefined) {
    data.available = body.available !== false
  }

  return { data, errors }
}
