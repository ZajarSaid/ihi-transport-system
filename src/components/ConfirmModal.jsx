import { useEffect } from 'react'
import Spinner from './Spinner'

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busyLabel = 'Working…',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !busy) onCancel?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel, busy])

  if (!open) return null

  return (
    <div
      className="confirm-modal-overlay"
      onClick={() => {
        if (!busy) onCancel?.()
      }}
    >
      <div
        className="confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-busy={busy}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="confirm-modal-title">{title}</h3>
        {message && <p className="confirm-modal-message">{message}</p>}
        <div className="confirm-modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
          >
            {busy && <Spinner size="sm" />}
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal