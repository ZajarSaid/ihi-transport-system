import Spinner from './Spinner'

function LoadingState({ label = 'Loading…', compact = false }) {
  return (
    <div
      className={`loading-state${compact ? ' loading-state-compact' : ''}`}
      role="status"
      aria-live="polite"
    >
      <Spinner />
      <span>{label}</span>
    </div>
  )
}

export default LoadingState
