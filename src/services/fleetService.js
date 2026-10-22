import { vehicles as seedVehicles, drivers as seedDrivers } from '../data/fleetData'

/**
 * The browser store is only a fallback for when the server cannot be reached.
 * The database is the source of truth for the fleet — see src/hooks/useFleet.js.
 */

const VEHICLES_KEY = 'trs_vehicles'
const DRIVERS_KEY = 'trs_drivers'

function loadCollection(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return seed
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : seed
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error)
    return seed
  }
}

function saveCollection(key, collection) {
  try {
    localStorage.setItem(key, JSON.stringify(collection))
    return true
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error)
    return false
  }
}

function nextNumericId(collection, prefix) {
  const max = collection.reduce((acc, item) => {
    const match = String(item.id).match(new RegExp(`^${prefix}(\\d+)$`))
    return match ? Math.max(acc, Number(match[1])) : acc
  }, 0)
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

function persist(key, collection, message) {
  if (!saveCollection(key, collection)) throw new Error(message)
}

export function getVehicles() {
  return loadCollection(VEHICLES_KEY, seedVehicles)
}

export function getVehicleById(id) {
  return getVehicles().find((v) => v.id === id) || null
}

export function getAvailableVehicles() {
  return getVehicles().filter((v) => v.available)
}

export function createVehicle(data) {
  const collection = getVehicles()
  const registration = (data.registration || '').trim()
  if (!registration) throw new Error('Vehicle registration is required.')
  const duplicate = collection.some(
    (v) => v.registration.trim().toLowerCase() === registration.toLowerCase(),
  )
  if (duplicate) throw new Error('A vehicle with this registration already exists.')
  const vehicle = {
    id: nextNumericId(collection, 'V'),
    registration,
    type: (data.type || '').trim(),
    capacity: Number(data.capacity) || 1,
    available: data.available !== false,
  }
  collection.push(vehicle)
  persist(VEHICLES_KEY, collection, 'Could not save the vehicle: browser storage is full.')
  return vehicle
}

export function updateVehicle(id, updates) {
  const collection = getVehicles()
  const index = collection.findIndex((v) => v.id === id)
  if (index === -1) return null
  if (updates.registration) {
    const registration = updates.registration.trim()
    const duplicate = collection.some(
      (v) =>
        v.id !== id &&
        v.registration.trim().toLowerCase() === registration.toLowerCase(),
    )
    if (duplicate) throw new Error('A vehicle with this registration already exists.')
    updates = { ...updates, registration }
  }
  const updated = { ...collection[index], ...updates }
  collection[index] = updated
  persist(VEHICLES_KEY, collection, 'Could not save the vehicle: browser storage is full.')
  return updated
}

export function deleteVehicle(id) {
  const collection = getVehicles()
  const next = collection.filter((v) => v.id !== id)
  if (next.length === collection.length) return false
  persist(VEHICLES_KEY, next, 'Could not delete the vehicle: browser storage is full.')
  return true
}

export function getDrivers() {
  return loadCollection(DRIVERS_KEY, seedDrivers)
}

export function getDriverById(id) {
  return getDrivers().find((d) => d.id === id) || null
}

export function getAvailableDrivers() {
  return getDrivers().filter((d) => d.available)
}

export function createDriver(data) {
  const collection = getDrivers()
  const name = (data.name || '').trim()
  const phone = (data.phone || '').trim()
  const email = (data.email || '').trim()
  if (!name) throw new Error('Driver name is required.')
  if (!phone) throw new Error('Driver phone number is required.')
  const duplicate = collection.some(
    (d) => d.name.trim().toLowerCase() === name.toLowerCase(),
  )
  if (duplicate) throw new Error('A driver with this name already exists.')
  const driver = {
    id: nextNumericId(collection, 'D'),
    name,
    phone,
    email,
    available: data.available !== false,
  }
  collection.push(driver)
  persist(DRIVERS_KEY, collection, 'Could not save the driver: browser storage is full.')
  return driver
}

export function updateDriver(id, updates) {
  const collection = getDrivers()
  const index = collection.findIndex((d) => d.id === id)
  if (index === -1) return null
  if (updates.name) {
    const name = updates.name.trim()
    const duplicate = collection.some(
      (d) => d.id !== id && d.name.trim().toLowerCase() === name.toLowerCase(),
    )
    if (duplicate) throw new Error('A driver with this name already exists.')
    updates = { ...updates, name }
  }
  const updated = { ...collection[index], ...updates }
  collection[index] = updated
  persist(DRIVERS_KEY, collection, 'Could not save the driver: browser storage is full.')
  return updated
}

export function deleteDriver(id) {
  const collection = getDrivers()
  const next = collection.filter((d) => d.id !== id)
  if (next.length === collection.length) return false
  persist(DRIVERS_KEY, next, 'Could not delete the driver: browser storage is full.')
  return true
}

export default {
  getVehicles,
  getVehicleById,
  getAvailableVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getDrivers,
  getDriverById,
  getAvailableDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
}