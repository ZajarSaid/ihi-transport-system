import { Link } from '../lib/nav'
import StatusBadge from './StatusBadge'

function RequestSummaryCard({ request, actions }) {
  return (
    <div className="request-summary card">
      <div className="summary-top">
        <div>
          <span className="summary-reference">{request.referenceNumber}</span>
          <StatusBadge status={request.status} />
        </div>
        <span className="summary-date">{request.trip?.travelDate}</span>
      </div>
      <div className="summary-applicant">
        <span className="summary-label">Applicant</span>
        <span className="summary-value">{request.applicant?.name}</span>
      </div>
      <div className="summary-trip">
        <div>
          <span className="summary-label">Origin</span>
          <span className="summary-value">{request.trip?.origin}</span>
        </div>
        <div className="summary-arrow">→</div>
        <div>
          <span className="summary-label">Destination</span>
          <span className="summary-value">{request.trip?.destination}</span>
        </div>
      </div>
      <div className="summary-passengers">
        <span className="summary-label">Passengers</span>
        <span className="summary-value">{request.trip?.passengerCount}</span>
        <span className="summary-dot">·</span>
        <span className="summary-label">Duration</span>
        <span className="summary-value">{request.trip?.estimatedDuration}</span>
      </div>
      <div className="summary-reason">
        <span className="summary-label">Reason</span>
        <span className="summary-value">{request.trip?.reason}</span>
      </div>
      <div className="summary-actions">
        <Link
          to={`/requests/${request.id}`}
          className="btn btn-secondary btn-sm"
        >
          View Details
        </Link>
        {actions}
      </div>
    </div>
  )
}

export default RequestSummaryCard