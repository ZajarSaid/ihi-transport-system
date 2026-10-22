import { useState, useEffect, useCallback } from 'react'

/**
 * A server that answers with an error status is not an outage: the message
 * ("a driver with this email already exists") has to reach the screen that
 * asked. Only a network failure falls back to the browser store, so the user
 * is never told a driver was saved when the server refused it.
 */
class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function apiFetch(url, options = {}) {
  let res
  try {
    res = await fetch(url, { cache: 'no-store', ...options })
  } catch {
    const error = new Error('The server could not be reached.')
    error.offline = true
    throw error
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(
      (data && data.error) || `The request failed (${res.status}).`,
      res.status,
    )
  }
  return data
}

function jsonBody(body) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

/**
 * The fleet lives in the database, so every change goes through the API.
 * The browser store is only a fallback for when the server cannot be reached
 * at all — it is never the source of truth, because the allocation screen
 * assigns vehicles and drivers by id and the database has to know about them.
 */
export function useFleet() {
  const [state, setState] = useState({ vehicles: [], drivers: [], loading: true, error: null })

  const fetchFleet = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const [vehicles, drivers] = await Promise.all([
        apiFetch('/api/fleet/vehicles'),
        apiFetch('/api/fleet/drivers'),
      ])
      setState({
        vehicles: Array.isArray(vehicles) ? vehicles : [],
        drivers: Array.isArray(drivers) ? drivers : [],
        loading: false,
        error: null,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        vehicles: [],
        drivers: [],
        loading: false,
        error: err.message || 'Failed to load fleet',
      }))
    }
  }, [])

  useEffect(() => {
    fetchFleet()
  }, [fetchFleet])

  const refresh = useCallback(async () => {
    await fetchFleet()
  }, [fetchFleet])

  /** Put one vehicle back into the list without a full reload. */
  const mergeVehicle = useCallback((vehicle) => {
    if (!vehicle) return
    setState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.some((v) => v.id === vehicle.id)
        ? prev.vehicles.map((v) => (v.id === vehicle.id ? vehicle : v))
        : [...prev.vehicles, vehicle],
    }))
  }, [])

  /** Put one driver back into the list without a full reload. */
  const mergeDriver = useCallback((driver) => {
    if (!driver) return
    setState((prev) => ({
      ...prev,
      drivers: prev.drivers.some((d) => d.id === driver.id)
        ? prev.drivers.map((d) => (d.id === driver.id ? driver : d))
        : [...prev.drivers, driver],
    }))
  }, [])

  const dropVehicle = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== id),
    }))
  }, [])

  const dropDriver = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      drivers: prev.drivers.filter((d) => d.id !== id),
    }))
  }, [])

  const createVehicle = useCallback(
    async (data) => {
      try {
        const created = await apiFetch('/api/fleet/vehicles', jsonBody(data))
        mergeVehicle(created)
        return created
      } catch (err) {
        if (!err.offline) throw err
        const { default: fleetService } = require('../services/fleetService')
        const created = fleetService.createVehicle(data)
        mergeVehicle(created)
        return created
      }
    },
    [mergeVehicle],
  )

  const editVehicle = useCallback(
    async (id, updates) => {
      try {
        const updated = await apiFetch(`/api/fleet/vehicles/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        mergeVehicle(updated)
        return updated
      } catch (err) {
        if (!err.offline) throw err
        const { default: fleetService } = require('../services/fleetService')
        const updated = fleetService.updateVehicle(id, updates)
        mergeVehicle(updated)
        return updated
      }
    },
    [mergeVehicle],
  )

  const removeVehicle = useCallback(
    async (id) => {
      try {
        await apiFetch(`/api/fleet/vehicles/${id}`, { method: 'DELETE' })
        dropVehicle(id)
        return true
      } catch (err) {
        if (!err.offline) throw err
        const { default: fleetService } = require('../services/fleetService')
        fleetService.deleteVehicle(id)
        dropVehicle(id)
        return true
      }
    },
    [dropVehicle],
  )

  const createDriver = useCallback(
    async (data) => {
      try {
        const created = await apiFetch('/api/fleet/drivers', jsonBody(data))
        mergeDriver(created)
        return created
      } catch (err) {
        if (!err.offline) throw err
        const { default: fleetService } = require('../services/fleetService')
        const created = fleetService.createDriver(data)
        mergeDriver(created)
        return created
      }
    },
    [mergeDriver],
  )

  const editDriver = useCallback(
    async (id, updates) => {
      try {
        const updated = await apiFetch(`/api/fleet/drivers/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        mergeDriver(updated)
        return updated
      } catch (err) {
        if (!err.offline) throw err
        const { default: fleetService } = require('../services/fleetService')
        const updated = fleetService.updateDriver(id, updates)
        mergeDriver(updated)
        return updated
      }
    },
    [mergeDriver],
  )

  const removeDriver = useCallback(
    async (id) => {
      try {
        await apiFetch(`/api/fleet/drivers/${id}`, { method: 'DELETE' })
        dropDriver(id)
        return true
      } catch (err) {
        if (!err.offline) throw err
        const { default: fleetService } = require('../services/fleetService')
        fleetService.deleteDriver(id)
        dropDriver(id)
        return true
      }
    },
    [dropDriver],
  )

  return {
    vehicles: state.vehicles,
    drivers: state.drivers,
    loading: state.loading,
    error: state.error,
    refresh,
    createVehicle,
    editVehicle,
    removeVehicle,
    createDriver,
    editDriver,
    removeDriver,
    getAvailableVehicles: () => state.vehicles.filter((v) => v.available),
    getAvailableDrivers: () => state.drivers.filter((d) => d.available),
    getVehicleById: (id) => state.vehicles.find((v) => v.id === id) || null,
    getDriverById: (id) => state.drivers.find((d) => d.id === id) || null,
  }
}
