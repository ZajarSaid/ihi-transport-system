'use client'

import { useState } from 'react'
import { useFleet } from '../../hooks/useFleet'
import { useToast } from '../../components/Toast'
import ConfirmModal from '../../components/ConfirmModal'
import Input from '../../components/Input'
import Spinner from '../../components/Spinner'
import LoadingState from '../../components/LoadingState'

const emptyVehicle = {
  registration: '',
  type: '',
  capacity: 4,
  available: true,
}

function VehicleList() {
  const {
    vehicles,
    createVehicle,
    editVehicle,
    removeVehicle,
    loading,
    error,
    refresh,
  } = useFleet()
  const toast = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyVehicle)
  const [errors, setErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyVehicle)
    setErrors({})
    setFormOpen(true)
  }

  const openEdit = (vehicle) => {
    setEditingId(vehicle.id)
    setForm({
      registration: vehicle.registration,
      type: vehicle.type,
      capacity: vehicle.capacity,
      available: vehicle.available,
    })
    setErrors({})
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setErrors({})
  }

  const validate = () => {
    const next = {}
    if (!form.registration.trim()) next.registration = 'Registration is required'
    if (!form.type.trim()) next.type = 'Vehicle type is required'
    const capacity = Number(form.capacity)
    if (!capacity || capacity < 1) next.capacity = 'Capacity must be at least 1 seat'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setSaving(true)
    try {
      if (editingId) {
        await editVehicle(editingId, { ...form, capacity: Number(form.capacity) })
        toast.success(`Vehicle ${form.registration.trim()} was updated.`)
      } else {
        const created = await createVehicle({ ...form, capacity: Number(form.capacity) })
        toast.success(`Vehicle ${created.registration} (${created.id}) was added.`)
      }
      closeForm()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await removeVehicle(deleteTarget.id)
      toast.success(`Vehicle ${deleteTarget.registration} was deleted.`)
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Vehicles</h2>
          <p className="page-subtitle">
            Add, modify or remove the vehicles available for transport
            allocation.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={openAdd}
            disabled={loading}
            aria-busy={loading}
          >
            Add Vehicle
          </button>
        </div>
      </div>

      {formOpen && (
        <div className="card fleet-form-card">
          <h3 className="action-panel-title">
            {editingId ? `Edit Vehicle — ${editingId}` : 'Add New Vehicle'}
          </h3>
          <form onSubmit={handleSubmit} noValidate>
            <fieldset className="fleet-form-fields" disabled={saving}>
              <div className="fleet-form-grid">
              <Input
                label="Registration Plate"
                name="registration"
                value={form.registration}
                onChange={handleChange}
                required
                placeholder="e.g. KWA 123A"
                error={errors.registration}
              />
              <Input
                label="Vehicle Type / Model"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                placeholder="e.g. Toyota Hiace"
                error={errors.type}
              />
              <Input
                label="Capacity (seats)"
                name="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={handleChange}
                required
                error={errors.capacity}
              />
              <label className="checkbox-label fleet-available-toggle">
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                />
                <span>Available for assignment</span>
              </label>
            </div>
            </fieldset>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                aria-busy={saving}
              >
                {saving && <Spinner size="sm" />}
                {saving
                  ? 'Saving…'
                  : editingId
                    ? 'Save Changes'
                    : 'Add Vehicle'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card">
          <LoadingState label="Loading vehicles..." />
        </div>
      ) : error ? (
        <div className="card error-state">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={refresh}>
            Retry
          </button>
        </div>
      ) : (
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Registration</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="fleet-empty">
                    No vehicles registered yet. Click “Add Vehicle” to create
                    one.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="ref-cell">{v.id}</td>
                    <td>{v.registration}</td>
                    <td>{v.type}</td>
                    <td>{v.capacity} seats</td>
                    <td>
                      <span
                        className={`badge ${v.available ? 'badge-approved' : 'badge-rejected'}`}
                      >
                        {v.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(v)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(v)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete vehicle"
        message={
          deleteTarget
            ? `Vehicle ${deleteTarget.registration} (${deleteTarget.type}) will be permanently removed. Requests already assigned to it keep their records.`
            : ''
        }
        confirmLabel="Delete"
        busyLabel="Deleting…"
        busy={deleting}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default VehicleList
