# Transport Request Management System — React-Only MVP

## 1. Project Objective

Build a professional React frontend prototype for a Hospital/Organization Transport Request Management System.

The system digitizes an existing paper-based transport request and approval workflow.

This is the **React-only MVP**.

There will be NO backend at this stage.

Use:

* React
* Vite
* JavaScript
* React Router
* CSS or the styling solution already present in the project
* LocalStorage
* Mock/local JavaScript data

The architecture must allow LocalStorage/mock data to later be replaced by a Django REST API without rewriting the UI.

---

# 2. CRITICAL PROJECT RULES

### Existing project

The React/Vite project has already been created and installed by the developer.

**DO NOT create a new project.**

DO NOT run:

* `npm create vite`
* `npm init`
* Any command that creates another React/Vite project

Work ONLY inside the existing project directory.

### Dependencies

Do not install unnecessary packages.

You may install a dependency ONLY if:

1. It is genuinely required for the implementation.
2. It is not already installed.
3. You explain why it is required.
4. You install it inside the existing project directory.

Do NOT install:

* Django
* Django REST Framework
* MySQL
* Express
* Firebase
* Supabase
* MongoDB
* JWT/authentication libraries
* Next.js
* Redux unless absolutely necessary
* External API services

Prefer native React and JavaScript solutions.

Do not change the project's existing setup unnecessarily.

---

# 3. Development Philosophy

The developer is learning React.

Do not generate the entire application at once.

Implement the project in phases.

After every phase:

1. Make sure the application runs.
2. Verify that previous functionality still works.
3. Explain what was implemented.
4. Explain important React concepts used.
5. List the files created/modified.
6. Explain important architectural decisions.
7. Stop and wait for the developer to request the next phase.

Do not unnecessarily refactor working code.

Do not over-engineer.

Keep the code readable and understandable.

---

# 4. Business Workflow

The system should simulate:

Applicant
↓
Create Transport Request
↓
Submit Request
↓
Leader Recommendation
↓
Project Accountant Funds Confirmation
↓
Transport/Admin Review
↓
Vehicle + Driver Allocation
↓
Transport Officer Approval
↓
Ready for Trip
↓
Security Gate Check
↓
Trip Completed
↓
Billing/Records

Possible statuses:

* Draft
* Submitted
* Pending Leader Recommendation
* Leader Approved
* Leader Rejected
* Pending Funds Confirmation
* Funds Confirmed
* Funds Not Available
* Pending Transport Review
* Vehicle Allocated
* Transport Approved
* Rejected
* Ready for Trip
* Completed
* Cancelled

---

# 5. Main Application Areas

## Applicant

### Transport Request Form

Fields:

* Request Reference Number — automatically generated
* Applicant Name
* Branch/Station
* Phone Number
* Email
* Project/Core Unit
* Cost Center
* Travel Date
* Departure Time
* Number of Passengers
* Trip Origin
* Destination
* Estimated Number of Days/Hours
* Reason for Trip

Reference example:

TR-2026-0001

The applicant must NOT manually enter the reference number.

### Passenger List

Allow users to dynamically:

* Add passengers
* Remove passengers
* Edit passenger names

### Applicant Declaration

Include:

* Applicant name
* Date
* Confirmation checkbox
* Signature placeholder/input

---

# 6. Request Status

After submission, display:

* Reference number
* Applicant
* Destination
* Travel date
* Submission date
* Current status

Show a visual workflow/timeline such as:

✓ Request Submitted
↓
✓ Leader Recommendation
↓
● Accountant Confirmation
↓
○ Transport Allocation
↓
○ Transport Approval
↓
○ Ready for Trip

---

# 7. Internal Dashboard

Create an internal management dashboard containing:

* Total Requests
* Pending Requests
* Approved Requests
* Rejected Requests
* Upcoming Trips
* Completed Trips

Request table:

* Reference
* Applicant
* Branch
* Destination
* Travel Date
* Passenger Count
* Status
* Actions

Filtering:

* Status
* Date
* Branch
* Applicant

---

# 8. Request Details

Create a detailed request page organized into:

1. Applicant Information
2. Trip Information
3. Passengers
4. Reason
5. Approval History
6. Vehicle Allocation
7. Driver Information
8. Security Information
9. Activity History

Do not create one giant form.

Use reusable cards/sections/components.

---

# 9. Approval Sections

### Leader

Allow:

* Review request
* Recommend
* Reject
* Add comment
* Record name/date

### Accountant

For project requests:

* View project
* View cost center
* Confirm funds
* Indicate funds unavailable
* Add comment
* Record name/date

Accountant confirmation should only be possible after leader recommendation.

---

# 10. Transport/Admin

Transport staff should be able to:

* View eligible requests
* Review request
* Select vehicle
* Select driver
* Add instructions
* Allocate vehicle
* Approve/reject transport

Create mock vehicles containing:

* Registration/ID
* Type
* Capacity
* Availability

Example types:

* Toyota Hilux
* Toyota Hiace
* Minibus
* Motorcycle

Create mock drivers containing:

* ID
* Name
* Phone
* Availability

---

# 11. Security Gate

Create a security interface displaying:

* Request reference
* Applicant
* Vehicle
* Driver
* Destination
* Travel date
* Passenger count
* Approval status

Allow the security officer to record:

* Checked by
* Date/time
* Gate status
* Comment

Do NOT implement QR scanning yet.

---

# 12. Printable Form

Create:

`/requests/:id/print`

This should reproduce the official transport form using HTML/CSS.

Include:

1. Request information
2. Applicant information
3. Trip details
4. Passenger list
5. Applicant declaration
6. Leader recommendation
7. Accountant confirmation
8. Transport/Admin section
9. Vehicle/driver allocation
10. Transport approval
11. Security gate section
12. Additional instructions

Use CSS `@media print`.

For this MVP, create a **printable HTML document first**.

Do NOT implement actual PDF generation yet.

---

# 13. Transport Information

Display the organization's transport rates as informational content:

* Vehicles: USD 1–1.2/km
* Minibus: USD 2/km
* Motorcycle: USD 0.65/km

Also display the relevant operational instructions regarding:

* Mileage
* Cost center approval
* Vehicle logbook
* Invoice
* Billing
* Returning the completed form to Transport/Administration

Do not implement automatic billing calculations yet.

---

# 14. Data Architecture

Use a clean structure similar to:

src/
components/
pages/
layouts/
services/
data/
hooks/
utils/

Do NOT scatter LocalStorage operations throughout components.

Create a service layer such as:

`src/services/requestService.js`

Functions may include:

```text
createRequest()
getRequests()
getRequestById()
updateRequest()
updateRequestStatus()
deleteRequest()
```

Initially these functions should use LocalStorage/mock data.

Later they should be replaceable with Axios/Django API calls.

---

# 15. Request Data Structure

Use a structure similar to:

```javascript
{
  id,
  referenceNumber,

  applicant: {
    name,
    branch,
    phone,
    email,
    projectUnit,
    costCenter
  },

  trip: {
    travelDate,
    departureTime,
    passengerCount,
    origin,
    destination,
    estimatedDuration,
    reason
  },

  passengers: [],

  applicantApproval: {},
  leaderApproval: {},
  fundsConfirmation: {},

  transportAllocation: {
    vehicleId,
    driverId,
    instructions
  },

  transportApproval: {},
  securityCheck: {},

  status,
  createdAt,
  updatedAt
}
```

Keep the structure clean because it will later map to Django models/API responses.

---

# 16. Mock Data

Create dedicated mock data for:

* Requests
* Vehicles
* Drivers
* Branches
* Projects
* Cost centers
* Staff/users

Do not repeatedly hardcode the same data inside components.

---

# 17. React Concepts

The implementation should naturally demonstrate:

* useState
* useEffect
* Props
* Controlled forms
* Form validation
* Arrays/objects in state
* Dynamic form fields
* Conditional rendering
* React Router
* URL parameters
* Reusable components
* LocalStorage
* Service/data abstraction
* Loading states
* Empty states
* Error states

Use `useMemo` or custom hooks only when they provide a real benefit.

---

# 18. Routes

Use React Router.

Create routes approximately like:

```text
/
 /requests
 /requests/new
 /requests/:id
 /requests/:id/status
 /requests/:id/print

/admin
/admin/requests
/admin/requests/:id

/approvals/leader
/approvals/accountant

/transport
/transport/requests
/transport/vehicles
/transport/drivers

/security
/security/check
```

Use layouts where appropriate.

---

# 19. UI

The application should look like a professional internal organizational system.

Include:

* Responsive design
* Sidebar
* Top navigation
* Cards
* Tables
* Forms
* Status badges
* Confirmation messages
* Loading states
* Empty states
* Error states

Keep the design clean and simple.

Do not overuse animations.

---

# 20. Validation

Validate:

* Required fields
* Email
* Phone
* Travel date
* Departure time
* Passenger count
* Origin
* Destination
* Reason
* Passenger names

Do not allow invalid requests to be submitted.

---

# 21. Business Rules

Implement these rules in the React prototype:

1. Applicant creates request.
2. Reference number is generated automatically.
3. Applicant cannot edit a request after submission.
4. Leader recommendation occurs before accountant confirmation.
5. Accountant confirmation occurs before transport allocation.
6. Vehicle allocation requires a vehicle and driver.
7. Transport approval occurs after allocation.
8. Security verification requires transport approval.
9. Completed requests become read-only.

Keep these rules centralized so they can later move to the backend.

---

# 22. Future Architecture

Current:

React Component
↓
Service Layer
↓
LocalStorage/Mock Data

Future:

React Component
↓
Service Layer
↓
Axios
↓
Django REST Framework
↓
MySQL

Do NOT implement the future backend now.

---

# 23. Development Phases

Implement ONLY ONE PHASE at a time.

### Phase 1

Project structure, layout, navigation and routing.

### Phase 2

Applicant transport request form.

### Phase 3

LocalStorage persistence.

### Phase 4

Request list and request details.

### Phase 5

Request status workflow.

### Phase 6

Leader recommendation.

### Phase 7

Accountant funds confirmation.

### Phase 8

Transport/Admin dashboard.

### Phase 9

Vehicle and driver allocation.

### Phase 10

Transport approval.

### Phase 11

Security gate verification.

### Phase 12

Printable transport form.

### Phase 13

Dashboard statistics and filtering.

### Phase 14

Validation, error handling, responsiveness and cleanup.

Do not implement later phases prematurely.

---

# 24. AI Coding Behavior

Before implementing a phase:

1. Briefly explain what will be built.
2. Identify the React concepts involved.
3. Implement only that phase.
4. Show the files created/modified.
5. Explain important code decisions.
6. Verify the application runs.
7. Do not modify unrelated functionality.
8. Do not install unnecessary packages.
9. Do not rewrite working code unnecessarily.
10. Stop after the requested phase.

If something is ambiguous, make a reasonable assumption and clearly state it.

The goal is not merely to produce code.

The goal is to produce a maintainable React application that the developer can understand and later migrate to Django.

---

# 25. FIRST COMMAND

Start by inspecting the EXISTING project.

Do NOT create a new project.

Do NOT run `npm create vite`.

Do NOT initialize another package/project.

First inspect:

* package.json
* existing src structure
* existing dependencies
* existing React/Vite configuration
* existing components

Then implement **PHASE 1 ONLY**.

If React Router is not installed and is required for Phase 1, explain why and install it using npm inside the existing project directory.

After Phase 1 is complete, stop and report what was done.

Do not continue to Phase 2 until explicitly instructed.
