'use client'

import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from '../../lib/nav'
import TransportRequestForm from '../../components/TransportRequestForm'
import { useRequests } from '../../hooks/useRequests'
import { useToast } from '../../components/Toast'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { REQUEST_STATUSES } from '../../utils/statusConfig'

function EditRequest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { updateRequest } = useRequests()
  const toast = useToast()
  const [saved, setSaved] = useState(false)
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/requests/${id}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          setRequest(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Loading request..." />
      </div>
    )
  }

  if (!request || (user && request.createdBy !== user.id)) {
    return (
      <div className="page">
        <div className="not-found card">
          <h2 className="page-title">Request Not Found</h2>
          <p>The request you are looking for does not exist.</p>
          <Link to="/requests" className="btn btn-secondary">
            Back to My Requests
          </Link>
        </div>
      </div>
    )
  }

  if (request.status !== REQUEST_STATUSES.DRAFT) {
    return (
      <div className="page">
        <div className="notice card">
          <h2 className="page-title">Cannot Edit</h2>
          <p className="notice-text">
            This request has already been submitted, so it can no longer be
            edited. Only draft requests can be modified before submission.
          </p>
          <Link to={`/requests/${id}`} className="btn btn-secondary">
            View Request
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (requestData) => {
    try {
      const updated = await updateRequest(id, {
        applicant: requestData.applicant,
        trip: requestData.trip,
        passengers: requestData.passengers,
        applicantDeclaration: requestData.applicantDeclaration,
        status: REQUEST_STATUSES.DRAFT,
      })
      setSaved(updated)
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (saved) {
    return (
      <div className="page">
        <div className="card success-panel">
          <div className="success-icon">✓</div>
          <h2 className="page-title">Changes Saved</h2>
          <p className="success-reference">
            Reference Number: <strong>{saved.referenceNumber}</strong>
          </p>
          <p className="success-text">
            Your draft has been updated. Submit it from My Requests when you
            are ready.
          </p>
          <div className="success-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/requests/${id}`)}
            >
              View Request
            </button>
            <Link className="btn btn-secondary" to="/requests">
              Back to My Requests
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Edit Transport Request</h2>
        <p className="page-subtitle">
          Edit draft {request.referenceNumber}. Changes are only possible while
          the request is still a draft.
        </p>
      </div>
      <TransportRequestForm
        onSubmit={handleSubmit}
        initialData={request}
        initialReference={request.referenceNumber}
        submitLabel="Save Changes"
      />
    </div>
  )
}

export default EditRequest