/**
 * Signature plumbing.
 *
 * The browser hands signatures over as data URLs — `SignatureUpload` reads the
 * picked file with a FileReader — but the database stores real bytes in the
 * `Signature` table. This module is the only place where that conversion
 * happens, so every write path stores signatures the same way and every read
 * path gets the same shape back.
 *
 * A signature may also be a plain string: a name typed instead of a file.
 * That is stored on `ApplicantDeclaration.typedSignature` and never becomes a
 * `Signature` row (see the schema comment on that field).
 */

export type SignaturePayload = {
  id?: string
  fileName?: string
  fileType?: string
  data?: string
}

/** The slice of the Prisma client the helpers below need. */
type SignatureStore = {
  signature: {
    create: (args: any) => Promise<{ id: string }>
  }
}

/**
 * Decode a data URL into the bytes and mime type the `Signature` table
 * expects. Returns null when the string is not a data URL.
 */
export function decodeDataUrl(dataUrl: string): { bytes: Buffer; mime: string } | null {
  if (!dataUrl || typeof dataUrl !== 'string') return null
  const match = /^data:([^;,]*)((?:;[^;,]*)*),(.*)$/s.exec(dataUrl)
  if (!match) return null

  const mime = match[1] || 'application/octet-stream'
  const parameters = match[2] || ''
  const payload = match[3] || ''

  try {
    const bytes = parameters.includes(';base64')
      ? Buffer.from(payload, 'base64')
      : Buffer.from(decodeURIComponent(payload), 'utf8')
    return { bytes, mime }
  } catch {
    return null
  }
}

/**
 * Store a signature and return the id of the new `Signature` row.
 *
 * - `null` / missing  → nothing to store, returns null
 * - a string          → a typed name, returns null (the caller keeps it as text)
 * - `{ id }` only     → already stored, returns that id
 * - `{ data }`        → a file, stored as bytes, returns the new id
 */
export async function storeSignature(
  tx: SignatureStore,
  requestId: string | null,
  signature: SignaturePayload | string | null | undefined,
): Promise<string | null> {
  if (!signature || typeof signature === 'string') return null
  if (!signature.data) return signature.id ?? null

  const decoded = decodeDataUrl(signature.data)
  if (!decoded) return null

  const row = await tx.signature.create({
    data: {
      requestId,
      fileName: signature.fileName || 'signature',
      fileType: signature.fileType || decoded.mime,
      data: decoded.bytes,
    },
  })

  return row.id
}

/**
 * Turn a `Signature` row back into the shape the browser renders: the bytes
 * come back as a data URL so `<img src={signature.data}>` keeps working.
 */
export function mapSignature(signature: any) {
  if (!signature) return undefined

  const bytes = signature.data
  const base64 = bytes
    ? Buffer.from(bytes as any).toString('base64')
    : ''

  return {
    id: signature.id,
    fileName: signature.fileName,
    fileType: signature.fileType,
    data: `data:${signature.fileType};base64,${base64}`,
  }
}
