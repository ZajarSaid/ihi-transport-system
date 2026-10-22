'use client'

import { useMemo, useState } from 'react'
import { Link } from '../../lib/nav'
import { useRequests } from '../../hooks/useRequests'
import StatusBadge from '../../components/StatusBadge'
import LoadingState from '../../components/LoadingState'
import Spinner from '../../components/Spinner'
import { ALL_STATUSES } from '../../utils/statusConfig'
import { branches } from '../../data/referenceData'

function AdminRequests() {
  const { requests, loading, error } = useRequests()
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    branch: '',
    applicant: '',
  })

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (filters.status && r.status !== filters.status) return false
      if (filters.date && r.trip?.travelDate !== filters.date) return false
      if (filters.branch && r.applicant?.branch !== filters.branch) return false
      if (
        filters.applicant &&
        !(r.applicant?.name || '')
          .toLowerCase()
          .includes(filters.applicant.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [requests, filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)
  const resultCount = filtered.length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">All Requests</h2>
          <p className="page-subtitle">
            Complete management table with filtering.
          </p>
        </div>
      </div>

      <div className="card filter-card">
        <div className="filter-grid">
          <div className="form-field">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Travel Date</label>
            <input
              className="form-control"
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Branch</label>
            <select
              className="form-control"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
            >
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Applicant</label>
            <input
              className="form-control"
              type="text"
              name="applicant"
              value={filters.applicant}
              onChange={handleFilterChange}
              placeholder="Search by applicant name..."
            />
          </div>
        </div>
        {hasActiveFilters && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              setFilters({ status: '', date: '', branch: '', applicant: '' })
            }
          >
            Clear Filters
          </button>
        )}
      </div>

      <p className="result-count">
        {loading ? (
          <>
            <Spinner size="sm" /> Loading requests…
          </>
        ) : error ? (
          'Error loading requests'
        ) : (
          `${resultCount} request${resultCount === 1 ? '' : 's'}`
        )}
      </p>

      {loading ? (
        <div className="card">
          <LoadingState label="Loading requests..." />
        </div>
      ) : error ? (
        <div className="error-state card">
          <p>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <p>No requests match the current filters.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Branch</th>
                  <th>Destination</th>
                  <th>Travel Date</th>
                  <th>Passengers</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="ref-cell">{r.referenceNumber}</td>
                    <td>{r.applicant?.name}</td>
                    <td>{branchName(r.applicant?.branch)}</td>
                    <td>{r.trip?.destination}</td>
                    <td>{r.trip?.travelDate}</td>
                    <td>{r.trip?.passengerCount}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      <Link
                        to={`/admin/requests/${r.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function branchName(id) {
  return branches.find((b) => b.id === id)?.name || '—'
}

export default AdminRequests