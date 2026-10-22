'use client'

import { Link } from '../lib/nav'
import { useRequests } from '../hooks/useRequests'
import { useAuth } from '../context/AuthContext'
import DashboardStats from '../components/DashboardStats'
import StatusBadge from '../components/StatusBadge'
import { formatDateShort } from '../utils/formatters'

function Home() {
  const { requests } = useRequests()
  const { user } = useAuth()

  const myRequests = requests.filter((r) => r.createdBy === user?.id)
  const recent = [...myRequests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Overview of your transport requests.
          </p>
        </div>
        <Link to="/requests/new" className="btn btn-primary">
          ＋ New Transport Request
        </Link>
      </div>

      <DashboardStats requests={myRequests} />

      <div className="home-grid">
        <div className="card">
          <div className="home-card-header">
            <h3 className="home-card-title">Recent Requests</h3>
            <Link to="/requests" className="home-card-link">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state compact">
              <p>No requests yet.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Applicant</th>
                    <th>Destination</th>
                    <th>Travel Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id}>
                      <td className="ref-cell">
                        <Link to={`/requests/${r.id}`}>{r.referenceNumber}</Link>
                      </td>
                      <td>{r.applicant?.name}</td>
                      <td>{r.trip?.destination}</td>
                      <td>{formatDateShort(r.trip?.travelDate)}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="home-side">
          <div className="card">
            <h3 className="home-card-title">Quick Actions</h3>
            <div className="quick-action-list">
              <Link to="/requests/new" className="btn btn-primary btn-block">
                New Request
              </Link>
              <Link to="/requests" className="btn btn-secondary btn-block">
                My Requests
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home