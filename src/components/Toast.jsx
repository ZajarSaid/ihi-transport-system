import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from 'react-icons/fi'

const ToastContext = createContext(null)

let toastId = 0

const TOAST_ICONS = {
  success: <FiCheckCircle />,
  error: <FiAlertCircle />,
  info: <FiInfo />,
  warning: <FiAlertTriangle />,
}

const TOAST_TITLES = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
  warning: 'Warning',
}

const DEFAULT_DURATION = 4500

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type, message, { title, duration = DEFAULT_DURATION } = {}) => {
      const id = ++toastId
      setToasts((prev) => [
        ...prev,
        { id, type, message, title: title || TOAST_TITLES[type] },
      ])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  const toast = {
    success: (msg, opts) => push('success', msg, opts),
    error: (msg, opts) => push('error', msg, opts),
    info: (msg, opts) => push('info', msg, opts),
    warning: (msg, opts) => push('warning', msg, opts),
    dismiss,
  }

  useEffect(() => {
    const timersRef = timers.current
    return () => {
      Object.values(timersRef).forEach(clearTimeout)
    }
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

function ToastItem({ toast, onDismiss }) {
  const { id, type, title, message } = toast
  const [exiting, setExiting] = useState(false)

  const handleDismiss = () => {
    setExiting(true)
    setTimeout(() => onDismiss(id), 300)
  }

  return (
    <div className={`toast toast-${type}${exiting ? ' toast-exit' : ''}`}>
      <div className="toast-icon">{TOAST_ICONS[type]}</div>
      <div className="toast-body">
        <p className="toast-title">{title}</p>
        <p className="toast-message">{message}</p>
      </div>
      <button
        className="toast-close"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <FiX />
      </button>
      <div className="toast-progress" />
    </div>
  )
}
