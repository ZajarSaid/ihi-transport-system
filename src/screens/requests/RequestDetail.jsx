'use client'

import { useState, useEffect } from 'react'
import { Link, useParams } from '../../lib/nav'
import { branches, projects } from '../../data/referenceData'
import DetailSection, { DetailGrid, DetailItem } from '../../components/DetailSection'
import StatusBadge from '../../components/StatusBadge'
import { SignaturePreview } from '../../components/SignatureUpload'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { canViewRequest } from '../../utils/access'

function RequestDetail() {
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
          <p>The request you are looking for does not exist or has been removed.</p>
          <Link to="/requests" className="btn btn-secondary">Back to My Requests</Link>
        </div>
      </div>
    )
  }

  const branch = branches.find((b) => b.id === request.applicant?.branch)
  const project = projects.find((p) => p.id === request.applicant?.projectUnit)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{request.referenceNumber}</h2>
          <div className="subtitle-line">
            <StatusBadge status={request.status} />
          </div>
        </div>
        <div className="header-actions">
          <Link to="/requests" className="btn btn-secondary">Back</Link>
          <Link to={`/requests/${id}/status`} className="btn btn-secondary">View Status</Link>
          <Link to={`/requests/${id}/print`} className="btn btn-secondary">Print</Link>
        </div>
      </div>

      <div className="section-stack">
        <DetailSection title="Applicant Information" subtitle="Who requested this transport">
          <DetailGrid>
            <DetailItem label="Name" value={request.applicant?.name} />
            <DetailItem label="Branch / Station" value={branch?.name} />
            <DetailItem label="Phone" value={request.applicant?.phone} />
            <DetailItem label="Email" value={request.applicant?.email} />
            <DetailItem label="Project / Core Unit" value={project?.name} />
            <DetailItem label="Cost Center" value={request.applicant?.costCenter} />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Trip Information" subtitle="Journey details">
          <DetailGrid>
            <DetailItem label="Travel Date" value={request.trip?.travelDate} />
            <DetailItem label="Departure Time" value={request.trip?.departureTime} />
            <DetailItem label="Passengers" value={request.trip?.passengerCount} />
            <DetailItem label="Estimated Duration" value={request.trip?.estimatedDuration} />
            <DetailItem label="Origin" value={request.trip?.origin} />
            <DetailItem label="Destination" value={request.trip?.destination} />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Passengers" subtitle={`${request.passengers?.length || 0} passengers`}>
          <ul className="passenger-list-static">
            {request.passengers?.length ? (
              request.passengers.map((p) => (
                <li key={p}>{p}</li>
              ))
            ) : (
              <li className="muted">No passengers listed</li>
            )}
          </ul>
        </DetailSection>

        <DetailSection title="Reason for Trip" subtitle="Why is this trip needed?">
          <p className="reason-text">{request.trip?.reason || '—'}</p>
        </DetailSection>

        <DetailSection title="Applicant Declaration" subtitle="Applicant confirmation">
          <DetailGrid>
            <DetailItem label="Declared By" value={request.applicantDeclaration?.applicantName} />
            <DetailItem label="Date" value={request.applicantDeclaration?.date} />
            <DetailItem label="Confirmed" value={request.applicantDeclaration?.confirmed ? 'Yes' : 'No'} />
            <SignatureDetail label="Signature" signature={request.applicantDeclaration?.signature} />
          </DetailGrid>
        </DetailSection>

        <ApprovalHistory request={request} />
        <VehicleAndDriver request={request} />
        <ActivityHistory request={request} />
      </div>
    </div>
  )
}

function SignatureDetail({ label, signature }) {
  return (
    <div className="detail-item detail-item-full">
      <span className="detail-label">{label}</span>
      <span className="detail-value">
        <SignaturePreview signature={signature} label={label} />
      </span>
    </div>
  )
}

function ApprovalHistory({ request }) {
  const entries = [
    {
      title: 'Head of Cost Center Approval',
      data: request.costCenterApproval,
      empty: 'Not yet reviewed',
    },
    {
      title: 'Branch Manager Approval',
      data: request.branchManagerApproval,
      empty: 'Not yet reviewed',
    },
    {
      title: 'Accountant Funds Confirmation',
      data: request.fundsConfirmation,
      empty: 'Not yet confirmed',
    },
  ]

  return (
    <DetailSection title="Approval History" subtitle="Chain of approvals">
      {entries.map(({ title, data, empty }) => (
        <div className="approval-block" key={title}>
          <h4 className="approval-title">{title}</h4>
          {data ? (
            <>
              <DetailGrid>
                <DetailItem label="Decision" value={formatDecision(data)} />
                <DetailItem label="Approved By" value={data.name} />
                <DetailItem label="Date" value={formatDate(data.date)} />
                <DetailItem label="Comment" value={data.comment} />
              </DetailGrid>
              <div className="approval-signature">
                <span className="detail-label">Official Signature</span>
                <SignaturePreview signature={data.signature} label={title} />
              </div>
            </>
          ) : (
            <p className="approval-empty">{empty}</p>
          )}
        </div>
      ))}
    </DetailSection>
  )
}

function VehicleAndDriver({ request }) {
  const allocation = request.transportAllocation
  return (
    <DetailSection title="Vehicle & Driver Assignment" subtitle="Assigned by receptionist">
      {allocation?.vehicleId || allocation?.driverId ? (
        <>
          <DetailGrid>
            <DetailItem label="Vehicle" value={allocation.vehicleName || allocation.vehicleId || '—'} />
            <DetailItem label="Driver" value={allocation.driverName || allocation.driverId || '—'} />
            <DetailItem label="Driver Phone" value={allocation.driverPhone} />
            <DetailItem label="Driver Email" value={allocation.driverEmail} />
            <DetailItem label="Assigned By" value={allocation.assignedBy || 'Receptionist'} />
            <DetailItem label="Instructions" value={allocation.instructions} multiline />
          </DetailGrid>
          <div className="approval-signature">
            <span className="detail-label">Receptionist Signature</span>
            <SignaturePreview signature={allocation.signature} label="Receptionist Signature" />
          </div>
        </>
      ) : (
        <p className="approval-empty">Vehicle and driver not yet assigned.</p>
      )}
    </DetailSection>
  )
}

function ActivityHistory({ request }) {
  const activities = [
    { label: 'Request Created', value: formatDate(request.createdAt) },
    { label: 'Submitted', value: '—' },
    { label: 'Last Updated', value: formatDate(request.updatedAt) },
    { label: 'Current Status', value: request.status },
  ]

  return (
    <DetailSection title="Activity History" subtitle="Key activity timestamps">
      <DetailGrid>
        {activities.map((a) => (
          <DetailItem key={a.label} label={a.label} value={a.value} />
        ))}
      </DetailGrid>
    </DetailSection>
  )
}

function formatDecision(data) {
  if (data.approved === true) return 'Approved'
  if (data.approved === false) return 'Rejected'
  if (data.fundsAvailable === true) return 'Funds Confirmed'
  if (data.fundsAvailable === false) return 'Funds Not Available'
  return data.decision || '—'
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export default RequestDetail