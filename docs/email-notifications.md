# Driver assignment emails

When a receptionist (or admin) completes a driver assignment, the request moves to
**Ready for Trip** and the driver is emailed the trip details: reference number,
applicant, date, departure time, route, passenger count, assigned vehicle and any
instructions. The email is built as a React component in
`src/emails/DriverAssignmentEmail.tsx`, rendered to HTML with `@react-email/render`,
and handed to Resend in `src/lib/email.tsx`, which is called from
`app/api/requests/[id]/allocation/route.ts` immediately after the allocation is
committed.

Sending is best-effort by design. The allocation is a database transaction; the
email is sent after it commits, and a missing key or a Resend outage is logged to
the server console and swallowed so the receptionist can still assign the driver.
The driver's name, phone and email are also snapshotted onto the
`TransportAllocation` row at the same time, so the printable transport form keeps
showing the right contact details even if the driver record is later edited or
removed.

To enable it, add the keys from `.env.example` to your local `.env` (and to your
hosting provider's environment variables) and restart the dev server:

| Key | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | API key from the Resend dashboard. |
| `EMAIL_FROM` | yes | Verified sender, e.g. `Transport Desk <transport@yourdomain.com>`. For a quick test, `onboarding@resend.dev` only delivers to the email on your Resend account. |
| `EMAIL_REPLY_TO` | no | Where replies go; defaults to no `Reply-To`. |
| `APP_URL` | no | Absolute URL used in the email footer link; falls back to `NEXTAUTH_URL` then `http://localhost:3000`. |

If `RESEND_API_KEY` or `EMAIL_FROM` is missing, the helper logs
`[email] Driver notification skipped` and returns without contacting Resend.
