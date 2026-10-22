import { useState } from 'react'
import { FiLogOut } from 'react-icons/fi'
import { signOut } from 'next-auth/react'
import { useAuth } from '../context/AuthContext'
import { roleLabel, initials, ROLE_META } from '../data/users'

function TopNav({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    /**
     * End the Auth.js session first, then clear the local session. Clearing
     * local state last lets ProtectedRoute perform the one client-side
     * navigation to /login; clearing it first let ProtectedRoute and the
     * signOut redirect race, so the login page painted twice (the "blink").
     */
    try {
      await signOut({ redirect: false })
    } catch (error) {
      // Still clear the local session; the Auth.js cookie can be cleared on
      // the next visit. A failed request must not trap the user in the app.
      console.error('Sign out request failed; clearing local session anyway.', error)
    } finally {
      logout()
    }
  }

  if (!user) {
    return (
      <header className="topnav">
        <div className="topnav-left">
          <h1 className="topnav-title">Transport Request Management</h1>
        </div>
      </header>
    )
  }

  const accent = ROLE_META[user.role]?.accent || '#3b82f6'

  return (
    <header className="topnav">
      <div className="topnav-left">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          <span className="menu-bar" />
          <span className="menu-bar" />
          <span className="menu-bar" />
        </button>
        <h1 className="topnav-title">Transport Request Management</h1>
      </div>
      <div className="topnav-right">
        <div className="topnav-user">
          <span className="user-avatar" style={{ background: accent }}>
            {initials(user.name)}
          </span>
          <span className="user-meta">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{roleLabel(user.role)}</span>
          </span>
        </div>
        <button
          className="topnav-logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <FiLogOut />
          <span className="logout-label">
            {loggingOut ? 'Signing out…' : 'Log out'}
          </span>
        </button>
      </div>
    </header>
  )
}

export default TopNav
