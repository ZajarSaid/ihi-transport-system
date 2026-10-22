'use client'

import { useState } from 'react'
import { useNavigate, Link } from '../../lib/nav'
import TransportRequestForm from '../../components/TransportRequestForm'
import { useRequests } from '../../hooks/useRequests'
import { useToast } from '../../components/Toast'
import { useAuth } from '../../context/AuthContext'

function NewRequest() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addRequest, requests } = useRequests()
  const toast = useToast()
  const [submitted, setSubmitted] = useState(null)

  const handleSubmit = async (requestData) => {
    try {
      const created = await addRequest({
        ...requestData,
        createdBy: user?.id,
        createdByName: user?.name,
      })
      setSubmitted(created)
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="card success-panel">
          <div className="success-icon">✓</div>
          <h2 className="page-title">Request Saved as Draft</h2>
          <p className="success-reference">
            Reference Number: <strong>{submitted.referenceNumber}</strong>
          </p>
          <p className="success-text">
            Your transport request has been saved as a draft. Go to My Requests
            and click <strong>Submit</strong> to send it to the head of the
            cost center for approval.
          </p>
          <div className="success-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setSubmitted(null)
                navigate('/requests/new')
              }}
            >
              Create Another Request
            </button>
            <Link className="btn btn-secondary" to="/requests">
              View My Requests
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">New Transport Request</h2>
        <p className="page-subtitle">
          Complete all sections below. Required fields are marked with an
          asterisk (*).
        </p>
      </div>
      <TransportRequestForm
        onSubmit={handleSubmit}
        existingRequests={requests || []}
      />
    </div>
  )
}

export default NewRequest

