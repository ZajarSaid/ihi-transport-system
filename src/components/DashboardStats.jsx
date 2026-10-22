import { computeDashboardStats } from '../utils/dashboardStats'

function DashboardStats({ requests }) {
  const stats = computeDashboardStats(requests)
  return (
    <div className="stats-grid">
      <StatCard label="Total Requests" value={stats.total} tone="total" />
      <StatCard label="Pending" value={stats.pending} tone="pending" />
      <StatCard label="Approved" value={stats.approved} tone="approved" />
      <StatCard label="Rejected" value={stats.rejected} tone="rejected" />
      <StatCard label="Upcoming Trips" value={stats.upcoming} tone="upcoming" />
      <StatCard label="Completed" value={stats.completed} tone="completed" />
    </div>
  )
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export default DashboardStats