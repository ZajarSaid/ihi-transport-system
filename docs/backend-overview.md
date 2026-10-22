# Backend Overview — one page

Django 5 + DRF. It owns the workflow rules, the data and the audit trail.
The React app is still 100 % `localStorage` — this is the map for swapping it over.

---

## 1. Directory map

```
backend/
├── config/           Django project: settings, routing, error envelope
│   ├── settings.py       every value read from env (see .env.example)
│   ├── urls.py           mounts /api/*, /admin/, /api/docs/, /api/schema/
│   ├── exceptions.py     every error -> {"detail", "code", "errors"}
│   ├── pagination.py     lists -> {"count", "next", "previous", "results"}
│   └── tests.py          guards the OpenAPI schema
├── accounts/         User (extends AbstractUser) + Role enum; /api/auth/*
├── reference/        Branch, CostCenter, Project, TransportRate, TransportInstruction
├── fleet/            Vehicle, Driver + IsFleetAdmin permission
└── transport/        the domain
    ├── models.py         TransportRequest, Passenger, Signature, Approval,
    │                     TransportAllocation, AuditLog, ReferenceCounter
    ├── workflow.py       the state machine — all the rules live here
    ├── references.py     TR-YYYY-NNNN allocation (row-locked counter)
    ├── scoping.py        who may see which requests
    ├── serializers.py    request & response shapes
    ├── views.py          the endpoints
    └── management/commands/seed_demo.py
```

**The five files that matter when wiring up the frontend:**

| File | Why |
| --- | --- |
| `transport/workflow.py` | every transition rule lives here — read it first |
| `transport/serializers.py` | the exact JSON you must send and receive |
| `transport/views.py` | the endpoint list |
| `transport/scoping.py` | replaces `src/utils/access.js` |
| `config/exceptions.py` | the error shape you must handle |

Live docs: `/api/docs/` (Swagger UI), `/api/redoc/`, `/api/schema/` (OpenAPI JSON).

---

## 2. The lifecycle

```
Draft ──submit──▶ Submitted ──cost centre──▶ Pending Branch Manager Approval
      ──branch manager──▶ Pending Funds Confirmation ──accountant──▶ Pending Driver Assignment
      ──reception──▶ Ready for Trip ──complete──▶ Completed
```

Each arrow is one POST endpoint. Each one requires, in this order:

**correct role → correct status → in scope → signature attached**

and writes an `AuditLog` row. The order matters: the role is checked *before*
the status, so an unauthorised user gets `403 forbidden_action` and never
learns which stage the request is sitting at.

Status strings are **byte-identical** to `src/utils/statusConfig.js`
`REQUEST_STATUSES` — there is no translation table to maintain.

---

## 3. How the form is generated

> **The backend does not generate a form. The frontend does — by hand, field by
> field. There is no schema, no form generator and no dynamic rendering
> anywhere in this project.**

Two completely separate hand-written React layouts:

| | File | How it is built |
| --- | --- | --- |
| **Input form** | `src/components/TransportRequestForm.jsx` (457 lines) | 4 `<SectionCard>` groups; every field is an explicit `<Input>` / `<Select>` / `<Textarea>` / `<SignatureUpload>` element. Layout is CSS Grid (`.form-grid`, `.form-grid-3`, `.form-grid-full`). Validation is a hand-written `validate()` returning dotted-path error keys (`'trip.destination'`). The form is `noValidate`, so the `required` prop is cosmetic — it only draws an asterisk. |
| **Print form** | `src/pages/requests/PrintRequest.jsx` (338 lines) | A separate hand-written flex layout, 10 numbered sections. It shares **no** components and **no** CSS with the input form. A4 comes from `@page { size: A4 portrait }`, mm-based sizing, `font-size: 12px` and `break-inside: avoid` on each section — the one-page result is content-driven, not a hard height constraint. |

The backend mirrors the **payload**, never the **layout**. In
`transport/serializers.py`, `TripSerializer` and `DeclarationSerializer` are
nested *inside* `TransportRequestCreateSerializer`, so the server enforces the
same rules the browser does — origin ≠ destination, passenger count == list
length, six required applicant fields, 1–50 passengers — but it never renders
a field.

So the form definition currently lives in **three** places that must agree:

1. the JSX fields,
2. `validate()` in the same file,
3. the backend write serializers,

plus `mapRequestToForm()` for the read direction and `src/data/seedRequests.js`
as example data.

If you later want a *generated* form, the natural place for a single
definition is one JSON/Python schema read by both sides — but that does not
exist today.

---

## 4. Connecting the frontend

### 4.1 The seam — three modules to change

| Today (`localStorage`) | Becomes |
| --- | --- |
| `src/utils/storage.js` — key `trs_requests`, whole array as one JSON blob | REST calls |
| `src/context/AuthContext.jsx` — plaintext `demoUsers` | `POST /api/auth/login/` + `GET /api/auth/me/` |
| `src/services/requestService.js` — the transition functions | the `/api/requests/...` endpoints |

### 4.2 Function → endpoint

| `requestService.js` | Endpoint |
| --- | --- |
| `createRequest` | `POST /api/requests/` |
| `updateRequest` | `PATCH /api/requests/{id}/` |
| `submitRequest` | `POST /api/requests/{id}/submit/` |
| `setCostCenterApproval` | `POST /api/requests/{id}/approvals/cost-center/` |
| `setBranchManagerApproval` | `POST /api/requests/{id}/approvals/branch-manager/` |
| `setFundsConfirmation` | `POST /api/requests/{id}/approvals/accountant/` |
| `assignDrivers` | `POST /api/requests/{id}/allocation/` |
| `markCompleted` | `POST /api/requests/{id}/complete/` |
| `getRequests` | `GET /api/requests/` (paginated) |
| `getRequestById` | `GET /api/requests/{id}/` |
| — | `GET /api/requests/{id}/history/` (audit trail) |
| — | `POST /api/requests/{id}/signatures/` (multipart upload) |

Replace the hard-coded reference data too:

| Today | Becomes |
| --- | --- |
| `src/data/referenceData.js` | `GET /api/reference/branches/` · `/projects/` · `/cost-centers/` |
| `src/data/fleetData.js` (rates + instructions) | `GET /api/reference/rates/` |
| `src/services/fleetService.js` | `GET /api/fleet/vehicles/` · `/api/fleet/drivers/` |
| `src/data/users.js` (`demoUsers`) | `GET /api/auth/me/` |

### 4.3 The shape mismatch — read this one

The frontend is camelCase everywhere. The API is **mixed**.

**Write** (`POST`/`PATCH /api/requests/`) — snake_case nested:

```json
{
  "applicant":  { "name", "branch", "phone", "email", "projectUnit", "costCenter" },
  "trip":       { "travel_date", "departure_time", "passenger_count",
                  "estimated_duration", "origin", "destination", "reason" },
  "passengers": ["..."],
  "applicant_declaration": { "confirmed", "applicant_name", "date", "signature_id" }
}
```

**Read** (`GET /api/requests/{id}/`) — snake_case at the top level,
camelCase *inside* the blocks:

```json
{
  "reference_number": "TR-2026-0001",
  "status": "Submitted",
  "applicant":  { "name", "branch", "branch_name", "phone", "email",
                  "projectUnit", "project_name", "costCenter" },
  "trip":       { "travelDate", "departureTime", "passengerCount",
                  "estimatedDuration", "origin", "destination", "reason" },
  "passengers": ["..."],
  "applicant_declaration": { "confirmed", "applicantName", "date", "signature" },
  "cost_center_approval": { }, "branch_manager_approval": { },
  "funds_confirmation": { },  "transport_allocation": { },
  "created_by", "created_by_name", "created_at", "updated_at"
}
```

| Frontend key | API key | Direction |
| --- | --- | --- |
| `referenceNumber` | `reference_number` | read |
| `applicantDeclaration` | `applicant_declaration` | read |
| `costCenterApproval` | `cost_center_approval` | read |
| `branchManagerApproval` | `branch_manager_approval` | read |
| `fundsConfirmation` | `funds_confirmation` | read |
| `transportAllocation` | `transport_allocation` | read |
| `createdAt` / `updatedAt` | `created_at` / `updated_at` | read |
| `createdBy` / `createdByName` | `created_by` / `created_by_name` | read |
| `trip.travelDate` | `trip.travel_date` | **write** |
| `trip.departureTime` | `trip.departure_time` | **write** |
| `trip.passengerCount` | `trip.passenger_count` | **write** |
| `trip.estimatedDuration` | `trip.estimated_duration` | **write** |
| `applicantDeclaration.applicantName` | `applicant_declaration.applicant_name` | **write** |
| `applicantDeclaration.signature` (base64) | upload file → `signature_id` | **write** |

Because the case differs *by direction* inside the same block, one global
rename map cannot do the job. The cheapest fix is to make the backend return
snake_case inside `applicant` / `trip` / `applicant_declaration` too, so a
single case conversion works both ways.

### 4.4 Three more things that will bite

1. **Signatures are base64 today.** The frontend embeds the file as a data URL
   inside the request object — that is why `requestService` catches "browser
   storage is full". The API wants a real multipart upload to
   `POST /api/requests/{id}/signatures/`, then the returned `signature_id` in
   the create payload. So the signature must be uploaded **before** the request
   is created (or: create → upload → PATCH with the id).
2. **Pagination.** Lists come back as `{count, next, previous, results}`.
   `src/hooks/useRequests.js` currently hard-codes `loading` to `false` and
   has no error state — it needs a genuinely async shape.
3. **Errors.** The API returns `{detail, code, errors}`, not DRF's default
   `{field: [message]}`. Use `code` — it is the stable machine-readable value:
   `invalid_transition` (409), `forbidden_action` (403), `out_of_scope` (403),
   `signature_required` (400), `declaration_required` (400), `invalid` (400).

Also delete `requestService.updateRequestStatus()` — it is an unguarded status
setter that bypasses every transition rule. The server now enforces them.

### 4.5 Suggested order of work

1. **Auth first** — `AuthContext` → `POST /api/auth/login/`, because every
   other call needs the bearer token.
2. **Reference data** — branches / projects / cost centres / rates / fleet.
   Read-only, and it unblocks the form's `<Select>` options.
3. **Requests** — create, list, retrieve.
4. **Signatures** (multipart) + submit.
5. **The three approval endpoints** + allocation + complete.
6. **Delete the client-side rules** — `src/utils/access.js` and the
   client-side transition guards. The server enforces them now, and the
   server also scopes by cost centre and branch, which the client never did.
