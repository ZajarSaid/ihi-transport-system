import FormField from './FormField'

function Input({ label, error, required = false, ...props }) {
  return (
    <FormField label={label} error={error} required={required}>
      <input
        className={`form-control ${error ? 'input-error' : ''}`}
        {...props}
      />
    </FormField>
  )
}

export default Input
