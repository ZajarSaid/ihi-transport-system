import { useState } from 'react'
import Spinner from './Spinner'

function ApprovalAction({
  approveLabel,
  rejectLabel,
  onApprove,
  onReject,
  requireComment = false,
  busy = false,
  disabled = false,
  hint,
}) {
  const [comment, setComment] = useState('')
  const [active, setActive] = useState(null)

  const run = async (action) => {
    if (active) return
    if (requireComment && !comment.trim()) return
    setActive(action)
    try {
      if (action === 'approve') {
        await onApprove({ comment: comment.trim() })
      } else {
        await onReject({ comment: comment.trim() })
      }
    } finally {
      setActive(null)
    }
  }

  const handleApprove = () => run('approve')
  const handleReject = () => run('reject')

  const commentRequired = requireComment && !comment.trim()
  const blocked = busy || commentRequired || disabled || Boolean(active)

  return (
    <div className="approval-action">
      <textarea
        className="form-control"
        placeholder="Add a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        disabled={Boolean(active)}
      />
      <div className="approval-action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleApprove}
          disabled={blocked}
          aria-busy={active === 'approve'}
        >
          {active === 'approve' && <Spinner size="sm" />}
          {active === 'approve' ? 'Approving…' : approveLabel}
        </button>
        <button
          className="btn btn-danger"
          onClick={handleReject}
          disabled={blocked}
          aria-busy={active === 'reject'}
        >
          {active === 'reject' && <Spinner size="sm" />}
          {active === 'reject' ? 'Rejecting…' : rejectLabel}
        </button>
      </div>
      {commentRequired && (
        <p className="approval-hint">
          A comment is required before you can {approveLabel.toLowerCase()} or{' '}
          {rejectLabel.toLowerCase()}.
        </p>
      )}
      {disabled && hint && <p className="approval-hint">{hint}</p>}
    </div>
  )
}

export default ApprovalAction