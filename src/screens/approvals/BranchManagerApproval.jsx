'use client'

import { useState } from 'react'
import { useRequests } from '../../hooks/useRequests'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import RequestSummaryCard from '../../components/RequestSummaryCard'
import ApprovalAction from '../../components/ApprovalAction'
import SignatureUpload from '../../components/SignatureUpload'
import StatusBadge from '../../components/StatusBadge'
import { REQUEST_STATUSES } from '../../utils/statusConfig'
import { projects } from '../../data/referenceData'

function BranchManagerApproval() {
  const { requests, setBranchManagerApproval } = useRequests()
  const { user } = useAuth()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [signature, setSignature] = useState(null)

  const pending = requests.filter(
    (r) => r.status === REQUEST_STATUSES.PENDING_BRANCH_MANAGER,
  )

  const selected =
    pending.find((r) => r.id === selectedId) || pending[0] || null

  const handleAction = (approved) => async (decision) => {
    if (!selected) return
    if (!signature) return
    setBusy(true)
    const approval = {
      approved,
      comment: decision.comment || '',
      name: user?.name || 'Branch Manager',
      date: new Date().toISOString(),
      signature,
    }
    try {
      const updated = await setBranchManagerApproval(selected.id, approval)
      toast.success(
        `Request ${updated.referenceNumber} was ${
          approved ? 'approved & forwarded to the accountant' : 'rejected'
        }.`,
      )
      setSelectedId(null)
      setSignature(null)
    } catch (err) {
      toast.error(err.message)
    }
    setBusy(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Branch Manager Approval</h2>
          <p className="page-subtitle">
            Review cost-center-approved requests and approve them to proceed to
            funds confirmation.
          </p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="empty-state card">
          <p>
            No requests are waiting for branch manager approval. Requests appear
            here after the head of the cost center approves them.
          </p>
        </div>
      ) : (
        <div className="approval-layout">
          <div className="approval-queue">
            {pending.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`queue-card card ${r.id === selected?.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedId(r.id)
                  setSignature(null)
                }}
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
                  <span className="queue-label">Project</span>
                  <span className="queue-value">
                    {
                      projects.find((p) => p.id === r.applicant?.projectUnit)
                        ?.name
                    }
                  </span>
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

          <div className="approval-panel">
            {selected ? (
              <>
                <RequestSummaryCard request={selected} />
                <div className="card action-panel">
                  <h3 className="action-panel-title">
                    {selected.referenceNumber} — Branch Manager Review
                  </h3>
                  <SignatureUpload
                    label="Your Official Signature"
                    value={signature}
                    onChange={setSignature}
                    required
                    hint="Attach your official signature as a picture or PDF. It is required for both approval and rejection."
                  />
                  <ApprovalAction
                    approveLabel="Approve"
                    rejectLabel="Reject"
                    onApprove={handleAction(true)}
                    onReject={handleAction(false)}
                    busy={busy}
                    disabled={!signature}
                    hint="Attach your signature to enable the decision buttons."
                  />
                </div>
              </>
            ) : (
              <div className="empty-state card">
                <p>Select a request from the queue to review.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchManagerApproval
