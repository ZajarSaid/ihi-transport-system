import FormField from './FormField'

function Select({ label, error, required = false, children, ...props }) {
  return (
    <FormField label={label} error={error} required={required}>
      <select
        className={`form-control ${error ? 'input-error' : ''}`}
        {...props}
      >
        <option value="">Select...</option>
        {children}
      </select>
    </FormField>
  )
}

export default Select
