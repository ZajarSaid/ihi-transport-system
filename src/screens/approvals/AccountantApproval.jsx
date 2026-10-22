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
import { branches, projects } from '../../data/referenceData'

function AccountantApproval() {
  const { requests, setFundsConfirmation } = useRequests()
  const { user } = useAuth()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [signature, setSignature] = useState(null)

  const pending = requests.filter(
    (r) => r.status === REQUEST_STATUSES.PENDING_FUNDS,
  )

  const selected =
    pending.find((r) => r.id === selectedId) || pending[0] || null

  const handleAction = (fundsAvailable) => async (decision) => {
    if (!selected) return
    if (!signature) return
    setBusy(true)
    const branch = branches.find((b) => b.id === selected.applicant?.branch)
    const project = projects.find(
      (p) => p.id === selected.applicant?.projectUnit,
    )
    const confirmation = {
      fundsAvailable,
      comment: decision.comment || '',
      name: user?.name || 'Project Accountant',
      date: new Date().toISOString(),
      project: project?.name,
      costCenter: selected.applicant?.costCenter,
      branch: branch?.name,
      signature,
    }
    try {
      const updated = await setFundsConfirmation(selected.id, confirmation)
      toast.success(
        `Request ${updated.referenceNumber}: funds ${
          fundsAvailable ? 'confirmed' : 'marked unavailable'
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
          <h2 className="page-title">Accountant Funds Confirmation</h2>
          <p className="page-subtitle">
            Confirm funds availability for branch-manager-approved requests.
          </p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="empty-state card">
          <p>
            No requests are waiting for funds confirmation. Requests appear
            here after the branch manager approves them.
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
                  <span className="queue-label">Cost Center</span>
                  <span className="queue-value">
                    {r.applicant?.costCenter}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="approval-panel">
            {selected ? (
              <>
                <RequestSummaryCard request={selected} />
                <div className="card finance-panel">
                  <h3 className="action-panel-title">
                    {selected.referenceNumber} — Funds Confirmation
                  </h3>
                  <div className="finance-fields">
                    <div className="finance-field">
                      <span className="finance-label">Project</span>
                      <span className="finance-value">
                        {
                          projects.find(
                            (p) => p.id === selected.applicant?.projectUnit,
                          )?.name
                        }
                      </span>
                    </div>
                    <div className="finance-field">
                      <span className="finance-label">Cost Center</span>
                      <span className="finance-value">
                        {selected.applicant?.costCenter}
                      </span>
                    </div>
                    <div className="finance-field">
                      <span className="finance-label">Branch / Station</span>
                      <span className="finance-value">
                        {
                          branches.find(
                            (b) => b.id === selected.applicant?.branch,
                          )?.name
                        }
                      </span>
                    </div>
                    <div className="finance-field">
                      <span className="finance-label">Estimated Cost Basis</span>
                      <span className="finance-value">
                        {selected.trip?.passengerCount} passengers ·{' '}
                        {selected.trip?.estimatedDuration}
                      </span>
                    </div>
                  </div>
                  <SignatureUpload
                    label="Your Official Signature"
                    value={signature}
                    onChange={setSignature}
                    required
                    hint="Attach your official signature as a picture or PDF. It is required to record the funds decision."
                  />
                  <ApprovalAction
                    approveLabel="Confirm Funds"
                    rejectLabel="Funds Not Available"
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

export default AccountantApproval