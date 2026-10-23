import { Resend } from 'resend'
import { render } from 'react-email'
import DriverAssignmentEmail, {
  type DriverAssignmentEmailProps,
} from '../emails/DriverAssignmentEmail'

type SendInput = Omit<DriverAssignmentEmailProps, 'appUrl'> & { to: string }

export type EmailResult =
  | { sent: true; id: string | null }
  | { sent: false; skipped?: boolean; error?: unknown }

/**
 * The SDK client is cached across requests, but keyed by the API key so that
 * editing `.env` in development picks up the new key without a restart.
 */
let cached: { key: string; client: Resend } | null = null
function getClient(apiKey: string) {
  if (!cached || cached.key !== apiKey) {
    cached = { key: apiKey, client: new Resend(apiKey) }
  }
  return cached.client
}

/**
 * Notify a driver that they have been assigned to a trip.
 *
 * Sending is best-effort: a missing key or a Resend outage is logged and
 * reported back to the caller, but it never fails the assignment itself.
 * Returning a result instead of throwing is deliberate — the receptionist
 * should still be able to complete the allocation when email is down.
 */
export async function sendDriverAssignmentEmail(input: SendInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  const replyTo = process.env.EMAIL_REPLY_TO
  const appUrl =
    process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

  if (!apiKey || !from) {
    console.warn(
      '[email] Driver notification skipped: RESEND_API_KEY and EMAIL_FROM must both be set in .env.',
    )
    return { sent: false, skipped: true }
  }

  const { to, ...props } = input

  try {
    const html = await render(<DriverAssignmentEmail {...props} appUrl={appUrl} />)
    const { data, error } = await getClient(apiKey).emails.send({
      from,
      to,
      replyTo: replyTo || undefined,
      subject: `Transport assignment ${props.referenceNumber} · ${props.origin} → ${props.destination}`,
      html,
    })

    if (error) {
      console.error('[email] Resend rejected the driver notification:', error)
      return { sent: false, error }
    }

    return { sent: true, id: data?.id ?? null }
  } catch (error) {
    console.error('[email] Failed to send the driver notification:', error)
    return { sent: false, error }
  }
}
