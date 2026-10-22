import SectionCard from './SectionCard'

function DetailSection({ title, subtitle, children }) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      {children}
    </SectionCard>
  )
}

export function DetailGrid({ children }) {
  return <div className="detail-grid">{children}</div>
}

export function DetailItem({ label, value, multiline = false }) {
  if (multiline) {
    return (
      <div className="detail-item detail-item-full">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value || '—'}</span>
      </div>
    )
  }
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || '—'}</span>
    </div>
  )
}

export default DetailSection