'use client'

import { useState } from 'react'
import { Link } from '../../lib/nav'
import { useRequests } from '../../hooks/useRequests'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import StatusBadge from '../../components/StatusBadge'
import ConfirmModal from '../../components/ConfirmModal'
import Spinner from '../../components/Spinner'
import LoadingState from '../../components/LoadingState'
import { REQUEST_STATUSES } from '../../utils/statusConfig'
import { ROLES } from '../../data/users'

function RequestList() {
  const {
    requests,
    loading,
    error,
    submitRequest,
    removeRequest,
    removeOwnedRequests,
  } = useRequests()
  const { user } = useAuth()
  const toast = useToast()
  const [confirmAction, setConfirmAction] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const isOwner = (req) => Boolean(user) && req.createdBy === user.id
  const ownedRequests = requests.filter(isOwner)
  const ownedDrafts = ownedRequests.filter(
    (req) => req.status === REQUEST_STATUSES.DRAFT,
  )
  const isApplicant = user?.role === ROLES.APPLICANT
  const visibleRequests = isApplicant ? ownedRequests : requests

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Loading requests..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-state">
          <p>{error}</p>
          <p>Please try again.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (req) => {
    if (!isOwner(req)) {
      toast.error('You can only submit your own requests.')
      return
    }
    if (pendingId) return
    setPendingId(req.id)
    try {
      const updated = await submitRequest(req.id)
      toast.success(
        `Request ${updated.referenceNumber} submitted and is now waiting for cost center approval.`,
      )
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = (req) => {
    if (!isOwner(req)) {
      toast.error('You can only delete your own requests.')
      return
    }
    setConfirmAction({
      type: 'delete',
      request: req,
      title: 'Delete request',
      message: `Delete draft ${req.referenceNumber}? This action cannot be undone.`,
    })
  }

  const handleReset = () => {
    if (ownedDrafts.length === 0) {
      toast.error('You have no draft requests to delete.')
      return
    }
    setConfirmAction({
      type: 'reset',
      title: 'Delete my requests',
      message: `Delete all ${ownedDrafts.length} of your draft requests? This cannot be undone. Submitted requests and other users' requests are not affected.`,
    })
  }

  const handleConfirm = async () => {
    if (!confirmAction || deleting) return
    setDeleting(true)
    try {
      if (confirmAction.type === 'delete') {
        await removeRequest(confirmAction.request.id)
        toast.success(`Draft ${confirmAction.request.referenceNumber} deleted.`)
      } else {
        await removeOwnedRequests(user.id)
        toast.success('Your requests have been deleted.')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
      setConfirmAction(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">My Requests</h2>
        <div className="page-actions">
          {ownedDrafts.length > 0 && (
            <button className="btn btn-secondary" onClick={handleReset}>
              Delete My Requests
            </button>
          )}
          {isApplicant && (
            <Link to="/requests/new" className="btn btn-primary">
              ＋ New Request
            </Link>
          )}
        </div>
      </div>

      {visibleRequests.length === 0 ? (
        <div className="empty-state card">
          <p>
            {isApplicant
              ? 'You have no transport requests yet.'
              : 'No requests found.'}
          </p>
          {isApplicant && (
            <Link to="/requests/new" className="btn btn-primary">
              Create your first request
            </Link>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Destination</th>
                  <th>Travel Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((req) => {
                  const owner = isOwner(req)
                  return (
                    <tr key={req.id}>
                      <td className="ref-cell">{req.referenceNumber}</td>
                      <td>
                        {req.applicant?.name}
                        {owner && <span className="owner-tag">You</span>}
                      </td>
                      <td>{req.trip?.destination}</td>
                      <td>{req.trip?.travelDate}</td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link
                            to={`/requests/${req.id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            View
                          </Link>
                          {req.status === REQUEST_STATUSES.DRAFT && owner && (
                            <>
                              <Link
                                to={`/requests/${req.id}/edit`}
                                className="btn btn-secondary btn-sm"
                              >
                                Edit
                              </Link>
                              <button
                                className="btn btn-secondary btn-sm btn-delete"
                                onClick={() => handleDelete(req)}
                                disabled={pendingId === req.id}
                              >
                                Delete
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSubmit(req)}
                                disabled={Boolean(pendingId)}
                                aria-busy={pendingId === req.id}
                              >
                                {pendingId === req.id && <Spinner size="sm" />}
                                {pendingId === req.id ? 'Submitting…' : 'Submit'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(confirmAction)}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        busyLabel="Deleting…"
        busy={deleting}
        danger
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}

export default RequestList
