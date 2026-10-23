import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'react-email'

export type DriverAssignmentEmailProps = {
  driverName: string
  referenceNumber: string
  applicantName: string
  travelDate: string
  departureTime: string
  origin: string
  destination: string
  passengerCount: number
  vehicleName: string
  instructions?: string | null
  assignedBy: string
  appUrl?: string
}

const main = { backgroundColor: '#f4f5f7', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  margin: '32px auto',
  maxWidth: '560px',
  padding: '32px',
}
const badge = {
  color: '#0f766e',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
}
const heading = { color: '#111827', fontSize: '22px', margin: '8px 0 4px' }
const intro = { color: '#374151', fontSize: '15px', lineHeight: '24px', margin: '0 0 20px' }
const sectionTitle = {
  color: '#6b7280',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}
const row = { borderBottom: '1px solid #f0f1f3', padding: '9px 0' }
const label = { color: '#6b7280', fontSize: '13px', margin: 0, width: '42%' }
const value = { color: '#111827', fontSize: '13px', fontWeight: 600, margin: 0 }
const note = {
  backgroundColor: '#f0fdfa',
  borderLeft: '3px solid #14b8a6',
  color: '#134e4a',
  fontSize: '13px',
  lineHeight: '21px',
  margin: '20px 0 0',
  padding: '12px 14px',
}
const footer = { color: '#9ca3af', fontSize: '12px', lineHeight: '19px', margin: '24px 0 0' }

function DetailRow({ labelText, valueText }: { labelText: string; valueText: string }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
      <tbody>
        <tr>
          <td style={{ ...row, ...label }}>{labelText}</td>
          <td style={{ ...row, ...value, textAlign: 'right' as const }}>{valueText}</td>
        </tr>
      </tbody>
    </table>
  )
}

export default function DriverAssignmentEmail({
  driverName,
  referenceNumber,
  applicantName,
  travelDate,
  departureTime,
  origin,
  destination,
  passengerCount,
  vehicleName,
  instructions,
  assignedBy,
  appUrl = 'http://localhost:3000',
}: DriverAssignmentEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You have been assigned to transport request {referenceNumber}: {origin} to{' '}
        {destination} on {travelDate}.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={badge}>Transport Assignment</Text>
          <Heading style={heading}>Hello {driverName},</Heading>
          <Text style={intro}>
            You have been assigned as the driver for transport request{' '}
            <strong>{referenceNumber}</strong>. The trip details are below.
          </Text>

          <Section>
            <Text style={sectionTitle}>Trip</Text>
            <DetailRow labelText="Reference" valueText={referenceNumber} />
            <DetailRow labelText="Requested by" valueText={applicantName || '—'} />
            <DetailRow labelText="Travel date" valueText={travelDate || '—'} />
            <DetailRow labelText="Departure time" valueText={departureTime || '—'} />
            <DetailRow labelText="Route" valueText={`${origin} → ${destination}`} />
            <DetailRow labelText="Passengers" valueText={String(passengerCount)} />
          </Section>

          <Section style={{ marginTop: '20px' }}>
            <Text style={sectionTitle}>Vehicle</Text>
            <DetailRow labelText="Assigned vehicle" valueText={vehicleName || '—'} />
          </Section>

          {instructions ? (
            <Text style={note}>
              <strong>Instructions:</strong> {instructions}
            </Text>
          ) : null}

          <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0 0' }} />
          <Text style={footer}>
            Assigned by {assignedBy || 'Reception'}. If you are unable to make this trip,
            contact the transport desk as soon as possible.
          </Text>
          <Text style={footer}>
            <Link href={appUrl} style={{ color: '#0f766e' }}>
              Open the Transport Request System
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
