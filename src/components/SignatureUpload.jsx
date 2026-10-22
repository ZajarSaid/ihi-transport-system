import { useRef, useState } from 'react'

const MAX_SIGNATURE_BYTES = 1024 * 1024

// eslint-disable-next-line react-refresh/only-export-components
export function hasSignature(signature) {
  if (!signature) return false
  if (typeof signature === 'string') return signature.trim().length > 0
  return Boolean(signature.data)
}

function isPdf(signature) {
  return (
    signature.fileType === 'application/pdf' ||
    (signature.fileName || '').toLowerCase().endsWith('.pdf')
  )
}

function SignatureUpload({
  label = 'Official Signature',
  value,
  onChange,
  required = false,
  error,
  hint,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [localError, setLocalError] = useState('')

  const showError = error || localError

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLocalError('')

    const isImageType = file.type.startsWith('image/')
    const isPdfType = file.type === 'application/pdf'
    const isPdfByName = file.name.toLowerCase().endsWith('.pdf')

    if (!isImageType && !isPdfType && !isPdfByName) {
      setLocalError('Only picture (PNG, JPG) or PDF files are allowed.')
      return
    }
    if (file.size > MAX_SIGNATURE_BYTES) {
      setLocalError('Signature file must be 1 MB or smaller.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      onChange({
        fileName: file.name,
        fileType: isPdfType || (!isImageType && isPdfByName) ? 'application/pdf' : file.type,
        data: reader.result,
      })
    }
    reader.onerror = () => setLocalError('Could not read the selected file. Please try again.')
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setLocalError('')
    onChange(null)
  }

  return (
    <div className="signature-upload">
      <span className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </span>

      {hasSignature(value) && typeof value !== 'string' ? (
        <div className="signature-attached">
          <div className="signature-preview-box">
            <SignaturePreview signature={value} />
          </div>
          <div className="signature-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={disabled}
              onClick={handleRemove}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <>
          {typeof value === 'string' && value.trim() && (
            <div className="signature-preview-box">
              <SignaturePreview signature={value} />
            </div>
          )}
          <button
            type="button"
            className="btn btn-secondary signature-upload-btn"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Attach Signature (Picture or PDF)
          </button>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        onChange={handleFile}
        disabled={disabled}
        hidden
      />

      <p className="form-hint">PNG, JPG or PDF · maximum 1 MB</p>
      {hint && !showError && !hasSignature(value) && <p className="form-hint">{hint}</p>}
      {showError && <span className="form-error">{showError}</span>}
    </div>
  )
}

export function SignaturePreview({ signature, label = 'Signature' }) {
  if (!hasSignature(signature)) {
    return <span className="signature-missing">Not provided</span>
  }
  if (typeof signature === 'string') {
    return <span className="signature-typed">{signature}</span>
  }
  if (!isPdf(signature)) {
    return <img className="signature-image" src={signature.data} alt={label} />
  }
  return (
    <a
      className="signature-pdf-link"
      href={signature.data}
      target="_blank"
      rel="noreferrer"
    >
      PDF · {signature.fileName}
    </a>
  )
}

export default SignatureUpload
