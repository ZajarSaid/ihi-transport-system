import FormField from './FormField'

function Textarea({ label, error, required = false, ...props }) {
  return (
    <FormField label={label} error={error} required={required}>
      <textarea
        className={`form-control ${error ? 'input-error' : ''}`}
        {...props}
      />
    </FormField>
  )
}

export default Textarea
