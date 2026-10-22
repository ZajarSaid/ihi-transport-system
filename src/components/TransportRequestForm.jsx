import { useState } from 'react'
import SectionCard from '../components/SectionCard'
import Input from '../components/Input'
import Select from '../components/Select'
import Textarea from '../components/Textarea'
import PassengerList from '../components/PassengerList'
import SignatureUpload from '../components/SignatureUpload'
import Spinner from '../components/Spinner'
import { branches, projects, costCenters } from '../data/referenceData'
import { isValidEmail, isValidPhone } from '../utils/validation'
import { generateReferenceNumber } from '../utils/reference'

function isValidTravelDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return !Number.isNaN(date.getTime()) && date >= today
}

const emptyForm = {
  applicant: {
    name: '',
    branch: '',
    phone: '',
    email: '',
    projectUnit: '',
    costCenter: '',
  },
  trip: {
    travelDate: '',
    departureTime: '',
    passengerCount: 1,
    origin: '',
    destination: '',
    estimatedDuration: '',
    reason: '',
  },
  passengers: [''],
  declaration: {
    confirmed: false,
    applicantName: '',
    date: '',
    signature: '',
  },
}

function mapRequestToForm(request) {
  return {
    applicant: {
      name: request.applicant?.name || '',
      branch: request.applicant?.branch || '',
      phone: request.applicant?.phone || '',
      email: request.applicant?.email || '',
      projectUnit: request.applicant?.projectUnit || '',
      costCenter: request.applicant?.costCenter || '',
    },
    trip: {
      travelDate: request.trip?.travelDate || '',
      departureTime: request.trip?.departureTime || '',
      passengerCount: request.trip?.passengerCount || 1,
      origin: request.trip?.origin || '',
      destination: request.trip?.destination || '',
      estimatedDuration: request.trip?.estimatedDuration || '',
      reason: request.trip?.reason || '',
    },
    passengers:
      request.passengers && request.passengers.length > 0
        ? request.passengers
        : [''],
    declaration: {
      confirmed: request.applicantDeclaration?.confirmed || false,
      applicantName: request.applicantDeclaration?.applicantName || '',
      date: request.applicantDeclaration?.date || '',
      signature: request.applicantDeclaration?.signature || '',
    },
  }
}

function TransportRequestForm({ onSubmit, existingRequests, initialReference, initialData, submitLabel = 'Submit Request' }) {
  const [form, setForm] = useState(() =>
    initialData ? mapRequestToForm(initialData) : emptyForm,
  )
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const referenceNumber =
    initialReference || generateReferenceNumber(existingRequests || [])

  const handleApplicantChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      applicant: { ...prev.applicant, [name]: value },
    }))
  }

  const handleTripChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      trip: { ...prev.trip, [name]: value },
    }))
  }

  const handlePassengerCountChange = (e) => {
    const value = Math.max(0, parseInt(e.target.value, 10) || 0)
    setForm((prev) => ({ ...prev, trip: { ...prev.trip, passengerCount: value } }))
  }

  const handlePassengersChange = (passengers) => {
    setForm((prev) => ({ ...prev, passengers }))
    if (submitted) {
      setErrors((prev) => ({ ...prev, passengers: undefined }))
    }
  }

  const handleDeclarationChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      declaration: { ...prev.declaration, [name]: type === 'checkbox' ? checked : value },
    }))
  }

  const validate = () => {
    const newErrors = {}
    const { applicant, trip } = form

    if (!applicant.name.trim()) newErrors['applicant.name'] = 'Name is required'
    if (!applicant.branch) newErrors['applicant.branch'] = 'Branch is required'
    if (!applicant.phone.trim()) {
      newErrors['applicant.phone'] = 'Phone is required'
    } else if (!isValidPhone(applicant.phone)) {
      newErrors['applicant.phone'] = 'Enter a valid phone number'
    }
    if (!applicant.email.trim()) {
      newErrors['applicant.email'] = 'Email is required'
    } else if (!isValidEmail(applicant.email)) {
      newErrors['applicant.email'] = 'Enter a valid email address'
    }
    if (!applicant.projectUnit) newErrors['applicant.projectUnit'] = 'Project is required'
    if (!applicant.costCenter) newErrors['applicant.costCenter'] = 'Cost center is required'

    if (!trip.travelDate) {
      newErrors['trip.travelDate'] = 'Travel date is required'
    } else if (!isValidTravelDate(trip.travelDate)) {
      newErrors['trip.travelDate'] = 'Travel date cannot be in the past'
    }
    if (!trip.departureTime) newErrors['trip.departureTime'] = 'Departure time is required'
    if (!trip.passengerCount || trip.passengerCount < 1) {
      newErrors['trip.passengerCount'] = 'At least 1 passenger required'
    } else if (trip.passengerCount > 50) {
      newErrors['trip.passengerCount'] = 'Maximum 50 passengers per trip'
    }
    if (!trip.origin.trim()) newErrors['trip.origin'] = 'Origin is required'
    if (!trip.destination.trim()) newErrors['trip.destination'] = 'Destination is required'
    if (trip.origin.trim() && trip.destination.trim() && trip.origin.trim().toLowerCase() === trip.destination.trim().toLowerCase()) {
      newErrors['trip.destination'] = 'Destination must differ from origin'
    }
    if (!trip.estimatedDuration.trim()) newErrors['trip.estimatedDuration'] = 'Estimated duration is required'
    if (!trip.reason.trim()) newErrors['trip.reason'] = 'Reason for trip is required'

    const filledPassengers = form.passengers.filter((p) => p.trim())
    if (filledPassengers.length !== trip.passengerCount) {
      newErrors.passengers = `Add exactly ${trip.passengerCount} passenger names`
    } else if (filledPassengers.some((p) => p.trim().length < 2)) {
      newErrors.passengers = 'Passenger names must be at least 2 characters'
    }

    if (!form.declaration.confirmed) newErrors['declaration.confirmed'] = 'You must confirm the declaration'
    if (!form.declaration.applicantName.trim()) newErrors['declaration.applicantName'] = 'Enter declaration applicant name'
    if (!form.declaration.date) newErrors['declaration.date'] = 'Date is required'
    const declarationSignature = form.declaration.signature
    if (
      !declarationSignature ||
      typeof declarationSignature === 'string' ||
      !declarationSignature.data
    ) {
      newErrors['declaration.signature'] =
        'Attach your official signature as a picture or PDF'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const newErrors = validate()
    setErrors(newErrors)
    setSubmitted(true)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    const requestData = {
      referenceNumber,
      applicant: form.applicant,
      trip: { ...form.trip, passengerCount: Number(form.trip.passengerCount) },
      passengers: form.passengers.filter((p) => p.trim()),
      applicantDeclaration: {
        ...form.declaration,
        date: form.declaration.date || new Date().toISOString().slice(0, 10),
      },
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setSubmitting(true)
    try {
      await onSubmit(requestData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="tr-form">
      <SectionCard
        title="Applicant Information"
        subtitle="Who is requesting this transport?"
      >
        <div className="form-grid form-grid-3">
          <Input
            label="Applicant Name"
            name="name"
            value={form.applicant.name}
            onChange={handleApplicantChange}
            required
            placeholder="Full name"
            error={errors['applicant.name']}
          />
          <Select
            label="Branch / Station"
            name="branch"
            value={form.applicant.branch}
            onChange={handleApplicantChange}
            required
            error={errors['applicant.branch']}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={form.applicant.phone}
            onChange={handleApplicantChange}
            required
            placeholder="+000 000 000 000"
            error={errors['applicant.phone']}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.applicant.email}
            onChange={handleApplicantChange}
            required
            placeholder="name@example.com"
            error={errors['applicant.email']}
          />
          <Select
            label="Project / Core Unit"
            name="projectUnit"
            value={form.applicant.projectUnit}
            onChange={handleApplicantChange}
            required
            error={errors['applicant.projectUnit']}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select
            label="Cost Center"
            name="costCenter"
            value={form.applicant.costCenter}
            onChange={handleApplicantChange}
            required
            error={errors['applicant.costCenter']}
          >
            {costCenters.map((cc) => (
              <option key={cc} value={cc}>
                {cc}
              </option>
            ))}
          </Select>
        </div>
      </SectionCard>

      <SectionCard
        title="Trip Information"
        subtitle="Plan your journey details"
      >
        <div className="form-grid">
          <div className="form-grid-inline">
            <Input
              label="Travel Date"
              name="travelDate"
              type="date"
              value={form.trip.travelDate}
              onChange={handleTripChange}
              required
              error={errors['trip.travelDate']}
            />
            <Input
              label="Departure Time"
              name="departureTime"
              type="time"
              value={form.trip.departureTime}
              onChange={handleTripChange}
              required
              error={errors['trip.departureTime']}
            />
          </div>
          <div className="form-field trip-count">
            <label className="form-label">
              Number of Passengers<span className="form-required">*</span>
            </label>
            <input
              className={`form-control ${errors['trip.passengerCount'] ? 'input-error' : ''}`}
              type="number"
              name="passengerCount"
              min="1"
              value={form.trip.passengerCount}
              onChange={handlePassengerCountChange}
            />
            {errors['trip.passengerCount'] && (
              <span className="form-error">{errors['trip.passengerCount']}</span>
            )}
          </div>
          <Input
            label="Trip Origin"
            name="origin"
            value={form.trip.origin}
            onChange={handleTripChange}
            required
            placeholder="Starting location"
            error={errors['trip.origin']}
          />
          <Input
            label="Destination"
            name="destination"
            value={form.trip.destination}
            onChange={handleTripChange}
            required
            placeholder="Final destination"
            error={errors['trip.destination']}
          />
          <Input
            label="Estimated Number of Days / Hours"
            name="estimatedDuration"
            value={form.trip.estimatedDuration}
            onChange={handleTripChange}
            required
            placeholder="e.g. 2 days or 6 hours"
            error={errors['trip.estimatedDuration']}
          />
          <div className="form-grid-full">
            <Textarea
              label="Reason for Trip"
              name="reason"
              value={form.trip.reason}
              onChange={handleTripChange}
              required
              rows={2}
              placeholder="Explain the purpose of this trip"
              error={errors['trip.reason']}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Passenger List"
        subtitle={`Add exactly ${form.trip.passengerCount} passenger name(s)`}
      >
        <PassengerList
          passengers={form.passengers}
          onChange={handlePassengersChange}
        />
        {errors.passengers && (
          <div className="passenger-form-error">{errors.passengers}</div>
        )}
      </SectionCard>

      <SectionCard
        title="Applicant Declaration"
        subtitle="Confirm the information provided is correct"
      >
        <div className="form-grid">
          <div className="form-grid-inline">
            <Input
              label="Applicant Name"
              name="applicantName"
              value={form.declaration.applicantName}
              onChange={handleDeclarationChange}
              required
              placeholder="Full name"
              error={errors['declaration.applicantName']}
            />
            <Input
              label="Date"
              name="date"
              type="date"
              value={form.declaration.date}
              onChange={handleDeclarationChange}
              required
              error={errors['declaration.date']}
            />
          </div>
          <div className="form-grid-full">
            <SignatureUpload
              label="Official Signature"
              value={form.declaration.signature}
              onChange={(signature) =>
                setForm((prev) => ({
                  ...prev,
                  declaration: { ...prev.declaration, signature },
                }))
              }
              required
              error={errors['declaration.signature']}
            />
          </div>
        </div>
        <div className="declaration-check">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="confirmed"
              checked={form.declaration.confirmed}
              onChange={handleDeclarationChange}
            />
            <span>
              I confirm that the information provided is accurate and complete.
            </span>
          </label>
          {errors['declaration.confirmed'] && (
            <div className="form-error">{errors['declaration.confirmed']}</div>
          )}
        </div>
      </SectionCard>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting && <Spinner size="sm" />}
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default TransportRequestForm
