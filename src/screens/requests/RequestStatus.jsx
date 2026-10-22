'use client'

import { useState, useEffect } from 'react'
import { Link, useParams } from '../../lib/nav'
import StatusBadge from '../../components/StatusBadge'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { canViewRequest } from '../../utils/access'
import {
  WORKFLOW_STEPS,
  getWorkflowProgress,
  TERMINAL_STATUSES,
  REQUEST_STATUSES,
} from '../../utils/statusConfig'

function RequestStatus() {
  const { id } = useParams()
  const { user } = useAuth()
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

  if (!request || !canViewRequest(user, request)) {
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

  const { currentKey, completedSteps } = getWorkflowProgress(request.status)
  const isRejected = TERMINAL_STATUSES.includes(request.status)
  const isComplete = request.status === REQUEST_STATUSES.COMPLETED

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{request.referenceNumber}</h2>
          <div className="subtitle-line">
            <StatusBadge status={request.status} />
            <span className="subtitle-detail">
              {request.trip?.destination} &middot; {request.trip?.travelDate}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <Link to={`/requests/${id}`} className="btn btn-secondary">
            View Details
          </Link>
        </div>
      </div>

      <div className="card status-card">
        <h3 className="status-card-title">Workflow Progress</h3>

        {isRejected && (
          <div className="status-banner status-banner-rejected">
            This request was not approved. It will not proceed further in the
            workflow.
          </div>
        )}

        <ol className="workflow">
          {WORKFLOW_STEPS.map((step, index) => {
            const isDone = completedSteps.includes(step.key)
            const isCurrent = currentKey === step.key && !isRejected
            return (
              <li
                key={step.key}
                className={[
                  'workflow-step',
                  isDone ? 'done' : '',
                  isCurrent ? 'current' : '',
                  isRejected && !isDone ? 'blocked' : '',
                ].join(' ')}
              >
                <div className="step-icon">
                  {isDone ? '✓' : isRejected && !isDone ? '✕' : index + 1}
                </div>
                <div className="step-content">
                  <span className="step-label">{step.label}</span>
                  {isCurrent && (
                    <span className="step-status-current">In progress</span>
                  )}
                  {isDone && !isCurrent && (
                    <span className="step-status-done">Complete</span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        {isComplete && (
          <div className="status-banner status-banner-complete">
            This trip has been completed and the request is now closed.
          </div>
        )}
      </div>

      <div className="status-meta card">
        <div className="status-meta-item">
          <span className="status-meta-label">Submitted</span>
          <span className="status-meta-value">
            {formatDate(request.createdAt)}
          </span>
        </div>
        <div className="status-meta-item">
          <span className="status-meta-label">Applicant</span>
          <span className="status-meta-value">
            {request.applicant?.name}
          </span>
        </div>
        <div className="status-meta-item">
          <span className="status-meta-label">Destination</span>
          <span className="status-meta-value">
            {request.trip?.destination}
          </span>
        </div>
        <div className="status-meta-item">
          <span className="status-meta-label">Travel Date</span>
          <span className="status-meta-value">
            {request.trip?.travelDate}
          </span>
        </div>
        <div className="status-meta-item">
          <span className="status-meta-label">Last Updated</span>
          <span className="status-meta-value">
            {formatDate(request.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export default RequestStatus