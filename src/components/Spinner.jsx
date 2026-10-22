function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      className={`spinner${size !== 'md' ? ` spinner-${size}` : ''}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    />
  )
}

export default Spinner
