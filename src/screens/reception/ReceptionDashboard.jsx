'use client'

import { useState } from 'react'
import { Link } from '../../lib/nav'
import { useRequests } from '../../hooks/useRequests'
import { useFleet } from '../../hooks/useFleet'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import RequestSummaryCard from '../../components/RequestSummaryCard'
import SignatureUpload from '../../components/SignatureUpload'
import StatusBadge from '../../components/StatusBadge'
import Spinner from '../../components/Spinner'
import LoadingState from '../../components/LoadingState'
import { REQUEST_STATUSES } from '../../utils/statusConfig'
import {
  transportRates,
  transportInstructions,
} from '../../data/fleetData'

function ReceptionDashboard() {
  const { requests, assignDrivers, markCompleted, loading: requestsLoading } =
    useRequests()
  const { vehicles, drivers, loading: fleetLoading } = useFleet()
  const { user } = useAuth()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState(null)
  const [assigning, setAssigning] = useState(false)
  const [completingId, setCompletingId] = useState(null)

  const pendingAssignment = requests.filter(
    (r) => r.status === REQUEST_STATUSES.PENDING_DRIVER_ASSIGNMENT,
  )
  const readyForTrip = requests.filter(
    (r) => r.status === REQUEST_STATUSES.READY_FOR_TRIP,
  )

  const selected =
    pendingAssignment.find((r) => r.id === selectedId) ||
    pendingAssignment[0] ||
    null

  const handleAssign = async (allocation) => {
    if (!selected || assigning) return
    setAssigning(true)
    try {
      const updated = await assignDrivers(selected.id, allocation)
      toast.success(
        `Request ${updated.referenceNumber}: vehicle and driver assigned. Form is ready to print.`,
      )
      setSelectedId(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAssigning(false)
    }
  }

  const handleComplete = async (request) => {
    if (completingId) return
    setCompletingId(request.id)
    try {
      const updated = await markCompleted(request.id)
      toast.success(`Request ${updated.referenceNumber} marked as completed.`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCompletingId(null)
    }
  }

  if (requestsLoading || fleetLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h2 className="page-title">Reception — Driver Assignment</h2>
            <p className="page-subtitle">
              Assign vehicles and drivers to accountant-approved requests, then
              print the transport form.
            </p>
          </div>
        </div>
        <div className="card">
          <LoadingState label="Loading reception data..." />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reception — Driver Assignment</h2>
          <p className="page-subtitle">
            Assign vehicles and drivers to accountant-approved requests, then
            print the transport form.
          </p>
        </div>
      </div>

      <div className="transport-layout">
        <div className="transport-main">
          {pendingAssignment.length === 0 ? (
            <div className="empty-state card">
              <p>
                No requests are waiting for driver assignment. Requests appear
                here after the accountant confirms funds.
              </p>
            </div>
          ) : (
            <div className="transport-queue">
              {pendingAssignment.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`queue-card card ${r.id === selected?.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                  disabled={assigning}
                >
                  <div className="queue-top">
                    <span className="queue-reference">{r.referenceNumber}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="queue-line">
                    <span className="queue-label">Applicant</span>
                    <span className="queue-value">{r.applicant?.name}</span>
                  </div>
                  <div className="queue-line">
                    <span className="queue-label">Destination</span>
                    <span className="queue-value">{r.trip?.destination}</span>
                  </div>
                  <div className="queue-line">
                    <span className="queue-label">Travel Date</span>
                    <span className="queue-value">{r.trip?.travelDate}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="transport-panel">
          {selected ? (
            <>
              <RequestSummaryCard request={selected} />
              <AllocationForm
                request={selected}
                vehicles={vehicles}
                drivers={drivers}
                assignedBy={user?.name}
                onSubmit={handleAssign}
                busy={assigning}
              />
            </>
          ) : (
            <div className="empty-state card">
              <p>Select a request to assign a vehicle and driver.</p>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="action-panel-title">Ready for Trip — Print Forms</h3>
        {readyForTrip.length === 0 ? (
          <p className="approval-empty">
            No requests are ready for printing yet.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Destination</th>
                  <th>Travel Date</th>
                  <th>Driver</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {readyForTrip.map((r) => (
                  <tr key={r.id}>
                    <td className="ref-cell">{r.referenceNumber}</td>
                    <td>{r.applicant?.name}</td>
                    <td>{r.trip?.destination}</td>
                    <td>{r.trip?.travelDate}</td>
                    <td>{r.transportAllocation?.driverName || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <Link
                          to={`/requests/${r.id}/print`}
                          className="btn btn-primary btn-sm"
                        >
                          Print Form
                        </Link>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleComplete(r)}
                          disabled={Boolean(completingId)}
                          aria-busy={completingId === r.id}
                        >
                          {completingId === r.id && <Spinner size="sm" />}
                          {completingId === r.id
                            ? 'Completing…'
                            : 'Mark Completed'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="info-grid">
        <div className="card info-card">
          <h3 className="info-title">Transport Rates</h3>
          <ul className="info-list">
            {transportRates.map((r) => (
              <li key={r.vehicle}>
                <span className="info-label">{r.vehicle}</span>
                <span className="info-value">{r.rate}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card info-card">
          <h3 className="info-title">Operational Instructions</h3>
          <ol className="info-list info-ordered">
            {transportInstructions.map((inst) => (
              <li key={inst}>{inst}</li>
            ))}
          </ol>
        </div>
        <div className="card info-card">
          <h3 className="info-title">Quick Links</h3>
          <div className="quick-links">
            <Link to="/reception/vehicles" className="btn btn-secondary">
              View Vehicles
            </Link>
            <Link to="/reception/drivers" className="btn btn-secondary">
              View Drivers
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function AllocationForm({
  request,
  vehicles,
  drivers,
  assignedBy,
  onSubmit,
  busy = false,
}) {
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [instructions, setInstructions] = useState('')
  const [signature, setSignature] = useState(null)

  const availableVehicles = vehicles.filter((v) => v.available)
  const availableDrivers = drivers.filter((d) => d.available)
  const passengerCount = request.trip?.passengerCount || 0

  const canSubmit = vehicleId && driverId && signature

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit || busy) return
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    const driver = drivers.find((d) => d.id === driverId)
    onSubmit({
      vehicleId,
      driverId,
      vehicleName: `${vehicle.type} · ${vehicle.registration}`,
      driverName: driver.name,
      driverPhone: driver.phone || '',
      driverEmail: driver.email || '',
      instructions: instructions.trim(),
      date: new Date().toISOString(),
      assignedBy: assignedBy || 'Receptionist',
      signature,
    })
  }

  return (
    <div className="card allocation-form">
      <h3 className="action-panel-title">Assign Vehicle &amp; Driver</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">
            Vehicle (must be available)
            <span className="form-required">*</span>
          </label>
          <select
            className="form-control"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            disabled={busy}
          >
            <option value="">Select vehicle...</option>
            {availableVehicles.map((v) => (
              <option
                key={v.id}
                value={v.id}
                disabled={v.capacity < passengerCount}
              >
                {v.type} · {v.registration} (capacity {v.capacity})
              </option>
            ))}
          </select>
          {availableVehicles.length === 0 && (
            <p className="form-hint">No vehicles are currently available.</p>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">
            Driver (must be available)
            <span className="form-required">*</span>
          </label>
          <select
            className="form-control"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            disabled={busy}
          >
            <option value="">Select driver...</option>
            {availableDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} · {d.phone}
                {d.email ? ` · ${d.email}` : ''}
              </option>
            ))}
          </select>
          {availableDrivers.length === 0 && (
            <p className="form-hint">No drivers are currently available.</p>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">Instructions</label>
          <textarea
            className="form-control"
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Special instructions for the driver..."
            disabled={busy}
          />
        </div>

        <div className="form-field">
          <SignatureUpload
            label="Receptionist Official Signature"
            value={signature}
            onChange={setSignature}
            required
            disabled={busy}
            hint="Attach your official signature as a picture or PDF. It is required to complete the assignment."
          />
        </div>

        {!canSubmit && (
          <p className="form-hint">
            Select an available vehicle and driver, and attach your signature to
            complete the assignment.
          </p>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit || busy}
            aria-busy={busy}
          >
            {busy && <Spinner size="sm" />}
            {busy ? 'Assigning…' : 'Assign & Prepare Form'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReceptionDashboard
