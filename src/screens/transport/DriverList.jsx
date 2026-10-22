'use client'

import { useState } from 'react'
import { useFleet } from '../../hooks/useFleet'
import { useToast } from '../../components/Toast'
import ConfirmModal from '../../components/ConfirmModal'
import Input from '../../components/Input'
import Spinner from '../../components/Spinner'
import LoadingState from '../../components/LoadingState'
import { isValidEmail, isValidPhone } from '../../utils/validation'

const emptyDriver = {
  name: '',
  phone: '',
  email: '',
  available: true,
}

function DriverList() {
  const {
    drivers,
    createDriver,
    editDriver,
    removeDriver,
    loading,
    error,
    refresh,
  } = useFleet()
  const toast = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyDriver)
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
    setForm(emptyDriver)
    setErrors({})
    setFormOpen(true)
  }

  const openEdit = (driver) => {
    setEditingId(driver.id)
    setForm({
      name: driver.name,
      phone: driver.phone,
      email: driver.email || '',
      available: driver.available,
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
    if (!form.name.trim()) next.name = 'Driver name is required'
    if (!form.phone.trim()) {
      next.phone = 'Phone number is required'
    } else if (!isValidPhone(form.phone)) {
      next.phone = 'Enter a valid phone number'
    }
    if (!form.email.trim()) {
      next.email = 'Email is required'
    } else if (!isValidEmail(form.email)) {
      next.email = 'Enter a valid email address'
    }
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      available: form.available,
    }
    setSaving(true)
    try {
      if (editingId) {
        await editDriver(editingId, payload)
        toast.success(`Driver ${payload.name} was updated.`)
      } else {
        const created = await createDriver(payload)
        toast.success(`Driver ${created.name} (${created.id}) was added.`)
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
      await removeDriver(deleteTarget.id)
      toast.success(`Driver ${deleteTarget.name} was deleted.`)
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
          <h2 className="page-title">Drivers</h2>
          <p className="page-subtitle">
            Add, modify or remove drivers with their phone number and email.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={openAdd}
            disabled={loading}
            aria-busy={loading}
          >
            Add Driver
          </button>
        </div>
      </div>

      {formOpen && (
        <div className="card fleet-form-card">
          <h3 className="action-panel-title">
            {editingId ? `Edit Driver — ${editingId}` : 'Add New Driver'}
          </h3>
          <form onSubmit={handleSubmit} noValidate>
            <fieldset className="fleet-form-fields" disabled={saving}>
              <div className="fleet-form-grid">
              <Input
                label="Driver Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Full name"
                error={errors.name}
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="+000 000 000 000"
                error={errors.phone}
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
                error={errors.email}
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
                    : 'Add Driver'}
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
          <LoadingState label="Loading drivers..." />
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
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="fleet-empty">
                    No drivers registered yet. Click “Add Driver” to create one.
                  </td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d.id}>
                    <td className="ref-cell">{d.id}</td>
                    <td>{d.name}</td>
                    <td>{d.phone}</td>
                    <td>{d.email || '—'}</td>
                    <td>
                      <span
                        className={`badge ${d.available ? 'badge-approved' : 'badge-rejected'}`}
                      >
                        {d.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(d)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(d)}
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
        title="Delete driver"
        message={
          deleteTarget
            ? `Driver ${deleteTarget.name} will be permanently removed. Requests already assigned to them keep their records.`
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

export default DriverList
