export function generateReferenceNumber(existingRequests = []) {
  const year = new Date().getFullYear()
  const prefix = `TR-${year}-`

  const maxSequence = existingRequests.reduce((max, req) => {
    const num = parseInt(req.referenceNumber?.replace(prefix, ''), 10)
    return Number.isFinite(num) && num > max ? num : max
  }, 0)

  const next = maxSequence + 1
  return `${prefix}${String(next).padStart(4, '0')}`
}
