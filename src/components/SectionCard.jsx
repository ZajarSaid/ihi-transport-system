
function SectionCard({ title, subtitle, children }) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <h3 className="section-card-title">{title}</h3>
        {subtitle && <p className="section-card-subtitle">{subtitle}</p>}
      </div>
      <div className="section-card-body">{children}</div>
    </section>
  )
}

export default SectionCard
