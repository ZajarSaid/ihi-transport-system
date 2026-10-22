
function FormField({ label, error, children, required = false }) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </label>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export default FormField
