'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navigate, useNavigate } from '../../lib/nav'
import { signIn } from 'next-auth/react'
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { ROLE_HOME } from '../../data/users'

const WORKFLOW = [
  'Applicant submits request',
  'Head of Cost Center approves',
  'Branch Manager approves',
  'Accountant confirms funds',
  'Receptionist assigns driver',
  'Print the transport form',
]

function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const fromPath = searchParams?.get ? searchParams.get('from') : null

  if (user) {
    const target = fromPath || ROLE_HOME[user.role] || '/'
    return <Navigate to={target} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      // Phase 3: use Auth.js credentials sign-in so the session lives in
      // the server-side session store. The legacy AuthContext still works
      // until Phase 4 migrates reads, so we also keep the local login in
      // sync for now.
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: fromPath || '/',
      })
      if (result?.error) {
        throw new Error('Invalid email or password. Please try again.')
      }
      const session = login(email, password)
      const target = fromPath || ROLE_HOME[session.role] || '/'
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">
            <span className="login-logo-mark">TRS</span>
            <span className="login-logo-text">Transport Request System</span>
          </div>

          <div className="login-brand-copy">
            <h1 className="login-brand-title">
              Route every trip through the{' '}
              <span className="login-accent">right approvals.</span>
            </h1>
            <p className="login-brand-subtitle">
              One workspace for applicants, cost centers, branch managers,
              accountants and reception.
            </p>
          </div>

          <ol className="login-workflow">
            {WORKFLOW.map((step, index) => (
              <li
                key={step}
                className="login-workflow-step"
                style={{ '--i': index }}
              >
                <span className="login-workflow-index">{index + 1}</span>
                <span className="login-workflow-label">{step}</span>
              </li>
            ))}
          </ol>

          <p className="login-brand-footer">
            Secure, role-based access · Demo environment
          </p>
        </div>
        <span className="login-orb login-orb-one" />
        <span className="login-orb login-orb-two" />
        <span className="login-orb login-orb-three" />
      </div>

      <div className="login-panel">
        <div className="login-card">
          <header className="login-card-head">
            <span className="login-card-badge">
              <FiShield />
              Sign in
            </span>
            <h2 className="login-card-title">Welcome back</h2>
            <p className="login-card-subtitle">
              Access your role workspace to continue.
            </p>
          </header>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="login-field-label">Email address</span>
              <span className="login-input">
                <FiMail className="login-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@trs.org"
                  autoComplete="username"
                  required
                />
              </span>
            </label>

            <label className="login-field">
              <span className="login-field-label">Password</span>
              <span className="login-input">
                <FiLock className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </span>
            </label>

            <button type="submit" className="login-submit" disabled={busy}>
              <span className="login-submit-label">
                {busy ? 'Signing in' : 'Sign in'}
              </span>
              {busy ? (
                <span className="login-spinner" aria-hidden="true" />
              ) : (
                <FiArrowRight />
              )}
            </button>
          </form>

          <p className="login-footnote">
            Use the credentials provided by your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
