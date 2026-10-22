'use client'

import { useState, useEffect } from 'react'
import { Link, useParams } from '../../lib/nav';
import { branches, projects } from "../../data/referenceData";
import { transportRates, transportInstructions } from "../../data/fleetData";
import { SignaturePreview } from "../../components/SignatureUpload";
import LoadingState from "../../components/LoadingState";
import logo from "../../assets/ifakara-logo.png";
import { useAuth } from "../../context/AuthContext";
import { canViewRequest } from "../../utils/access";

function PrintRequest() {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/requests/${id}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          setRequest(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Loading request..." />
      </div>
    )
  }

  if (!request || !canViewRequest(user, request)) {
    return (
      <div className="page">
        <div className="not-found card">
          <h2 className="page-title">Request Not Found</h2>
          <p>The request you are looking for does not exist.</p>
          <Link to="/requests" className="btn btn-secondary">
            Back to My Requests
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="print-page">
      <div className="print-toolbar no-print">
        <div>
          <h2 className="page-title">Official Transport Request Form</h2>
        </div>
        <div className="print-actions">
          <Link to={`/requests/${id}`} className="btn btn-secondary">
            Back
          </Link>
          <button className="btn btn-primary" onClick={() => window.print()}>
            🖨 Print
          </button>
        </div>
      </div>

      <div className="print-form" id="print-form">
        <TFormHeader request={request} />

        <TFormSection title="1. Request Information">
          <FieldLine
            fields={[
              ["Ref No.", request.referenceNumber],
              ["Request Date", formatDay(request.createdAt)],
              ["Declared On", formatDay(request.applicantDeclaration?.date)],
            ]}
          />
          <FieldBlock label="Status" value={request.status} />
        </TFormSection>

        <TFormSection title="2. Applicant Information">
          <FieldLine
            fields={[
              ["Name", request.applicant?.name, 2],
              ["Branch / Station", branchName(request.applicant?.branch), 1.6],
              ["Phone", request.applicant?.phone, 1],
            ]}
          />
          <FieldLine
            fields={[
              ["Email", request.applicant?.email, 2],
              [
                "Project / Core Unit",
                projectName(request.applicant?.projectUnit),
                1.6,
              ],
              ["Cost Center", request.applicant?.costCenter, 1],
            ]}
          />
        </TFormSection>

        <TFormSection title="3. Trip Information">
          <FieldLine
            fields={[
              ["Travel Date", formatDay(request.trip?.travelDate)],
              ["Departure Time", request.trip?.departureTime],
              ["Passengers", request.trip?.passengerCount],
            ]}
          />
          <FieldLine
            fields={[
              ["Est. Duration", request.trip?.estimatedDuration],
              ["Origin", request.trip?.origin, 1.5],
              ["Destination", request.trip?.destination, 1.5],
            ]}
          />
          <FieldBlock label="Reason for Trip" value={request.trip?.reason} />
        </TFormSection>

        <TFormSection title="4. Passenger List">
          {request.passengers?.length ? (
            <ul className="print-passengers">
              {request.passengers.map((p, index) => (
                <li key={`${p}-${index}`}>{p}</li>
              ))}
            </ul>
          ) : (
            <p className="print-empty">No passengers listed.</p>
          )}
        </TFormSection>

        <TFormSection title="5. Applicant Declaration">
          <FieldLine
            fields={[
              [
                "Applicant Name",
                request.applicantDeclaration?.applicantName,
                2,
              ],
              ["Date", formatDay(request.applicantDeclaration?.date)],
              [
                "Confirmed",
                request.applicantDeclaration?.confirmed ? "Yes" : "No",
              ],
            ]}
          />
          <PrintSignature
            label="Applicant Signature"
            signature={request.applicantDeclaration?.signature}
          />
        </TFormSection>

        <TFormSection title="6. Head of Cost Center Approval">
          <ApprovalBlock
            data={request.costCenterApproval}
            empty="Pending cost center review."
          />
        </TFormSection>

        <TFormSection title="7. Branch Manager Approval">
          <ApprovalBlock
            data={request.branchManagerApproval}
            empty="Pending branch manager review."
          />
        </TFormSection>

        <TFormSection title="8. Accountant Funds Confirmation">
          <ApprovalBlock
            data={request.fundsConfirmation}
            empty="Pending confirmation."
          />
        </TFormSection>

        <TFormSection title="9. Reception — Vehicle & Driver Assignment">
          {request.transportAllocation ? (
            <>
              <FieldLine
                fields={[
                  ["Vehicle", request.transportAllocation.vehicleName],
                  ["Driver", request.transportAllocation.driverName, 1.5],
                  ["Driver Phone", request.transportAllocation.driverPhone],
                ]}
              />
              <FieldLine
                fields={[
                  [
                    "Driver Email",
                    request.transportAllocation.driverEmail,
                    1.5,
                  ],
                  [
                    "Assigned By",
                    request.transportAllocation.assignedBy || "Receptionist",
                  ],
                  ["Assigned On", formatDay(request.transportAllocation.date)],
                ]}
              />
              <FieldBlock
                label="Instructions"
                value={request.transportAllocation.instructions}
              />
              <PrintSignature
                label="Receptionist Signature"
                signature={request.transportAllocation.signature}
              />
            </>
          ) : (
            <p className="print-empty">Not yet assigned.</p>
          )}
        </TFormSection>

        <TFormSection title="10. Additional Instructions & Rates">
          <div className="print-notes">
            <div>
              <h4 className="print-subhead">Transport Rates</h4>
              <ul className="print-rates">
                {transportRates.map((r) => (
                  <li key={r.vehicle}>
                    {r.vehicle}: {r.rate}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="print-subhead">Operational Instructions</h4>
              <ul className="print-rates">
                {transportInstructions.map((inst) => (
                  <li key={inst}>{inst}</li>
                ))}
              </ul>
            </div>
          </div>
        </TFormSection>
      </div>
    </div>
  );
}

function TFormHeader({ request }) {
  return (
    <div className="print-header">
      <div className="print-header-left">
        <h1 className="print-title">TRANSPORT FORM</h1>
        <div className="print-ref">
          <span className="print-ref-label">Reference</span>
          <span className="print-ref-value">{request.referenceNumber}</span>
        </div>
      </div>
      <div className="print-header-brand">
        <img className="print-logo" src={logo.src} alt="Ifakara Health Institute" />
      </div>
    </div>
  );
}

function TFormSection({ title, children }) {
  return (
    <section className="print-section">
      <h3 className="print-section-title">{title}</h3>
      <div className="print-section-body">{children}</div>
    </section>
  );
}

/**
 * Renders a row of related fields on a single line. Each field keeps its
 * label inline with the value and the value sits on a ruled line so the
 * printed form reads like a fill-in form and stays compact.
 */
function FieldLine({ fields }) {
  return (
    <div className="print-line">
      {fields.map(([label, value, grow], index) => (
        <div
          className="print-field"
          key={index}
          style={grow ? { flexGrow: grow } : undefined}
        >
          <span className="print-field-label">{label}</span>
          <span className="print-field-value">{displayValue(value)}</span>
        </div>
      ))}
    </div>
  );
}

/** Single field that occupies the full width of the section (long answers). */
function FieldBlock({ label, value }) {
  return (
    <div className="print-line">
      <div className="print-field print-field-full">
        <span className="print-field-label">{label}</span>
        <span className="print-field-value">{displayValue(value)}</span>
      </div>
    </div>
  );
}

function ApprovalBlock({ data, empty }) {
  if (!data) return <p className="print-empty">{empty}</p>;
  let decision = "—";
  if (data.approved === true) decision = "Approved";
  else if (data.approved === false) decision = "Rejected";
  else if (data.fundsAvailable === true) decision = "Funds Confirmed";
  else if (data.fundsAvailable === false) decision = "Funds Not Available";
  return (
    <>
      <FieldLine
        fields={[
          ["Decision", decision],
          ["Name", data.name, 2],
          ["Date", formatDay(data.date)],
        ]}
      />
      <FieldBlock label="Comment" value={data.comment} />
      <PrintSignature label="Official Signature" signature={data.signature} />
    </>
  );
}

function PrintSignature({ label, signature }) {
  return (
    <div className="print-signature">
      <span className="print-signature-label">{label}</span>
      <span className="print-signature-value">
        <SignaturePreview signature={signature} label={label} />
      </span>
    </div>
  );
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function formatDay(value) {
  if (!value) return "";
  const raw = String(value);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString();
}

function branchName(id) {
  return branches.find((b) => b.id === id)?.name || "—";
}

function projectName(id) {
  return projects.find((p) => p.id === id)?.name || "—";
}

export default PrintRequest;
