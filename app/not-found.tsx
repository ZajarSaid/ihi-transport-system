import { Link } from '@/src/lib/nav'

export default function NotFound() {
  return (
    <div className="page">
      <div className="not-found card">
        <h2 className="page-title">Page Not Found</h2>
        <p>The page you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
