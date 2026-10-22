# Transport Request System

Transport request and approval system for the Ifakara Health Institute.

* **Front end** — React 19 rendered by the Next.js 16 App Router (`app/`).
* **Back end** — the same Next.js app, reading and writing through Prisma 7.
* **Database** — SQLite for now; Postgres in Phase 7.

The printable transport form (`src/screens/requests/PrintRequest.jsx`) fits on
a single A4 page and carries the IFAKARA letterhead.

---

## Running it

```bash
npm install          # also runs `prisma generate`
npm run db:migrate   # create/apply the SQLite database
npm run db:seed      # load the demo reference data, fleet, users and requests
npm run dev          # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on <http://localhost:3000> |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint over the JavaScript and TypeScript sources |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Create and apply a migration (`prisma migrate dev`) |
| `npm run db:seed` | Reset and reseed the demo data |
| `npm run db:studio` | Prisma Studio — browse the tables at <http://localhost:5555> |
| `npm run db:generate` | Regenerate the Prisma client after a schema change |

`DATABASE_URL` lives in `.env` (see `.env.example`). It is a SQLite file at
`prisma/dev.db`; Phase 7 swaps it for a Postgres connection string and
nothing else in the code changes.

---

## Where the project is

The migration off `localStorage` is planned in [`Phases.txt`](Phases.txt).
Each phase ends with the app running and verified.

| Phase | What it covers | Status |
| --- | --- | --- |
| 1 | Next.js shell, zero behaviour change | done |
| 2 | Prisma schema, SQLite and the seed script | done |
| 3 | Auth.js v5 and route protection | to do |
| 4 | Reads from the database | to do |
| 5 | Writes and the server-side workflow engine | to do |
| 6 | Real signature bytes | to do |
| 7 | Reference counter, print, deploy | to do |

Until Phase 4 lands, the screens still read from `localStorage`; the database
exists and is seeded, but nothing reads from it yet.

**Start here:** [`docs/backend-overview.md`](docs/backend-overview.md) — the
map of the domain: the workflow, the JSON shapes and the pitfalls that bite
when the front end is wired to a real API.

---

## Roles

| Role | Responsibility |
| --- | --- |
| Applicant | Create, submit and track transport requests |
| Head of Cost Center | Approve requests for their cost centre |
| Branch Manager | Approve cost-centre-approved requests |
| Accountant | Confirm funds availability |
| Receptionist | Assign vehicles and drivers, print forms |
| Administrator | Oversee every request and all reference data |

The workflow runs:

```
Draft → Submitted → Pending Branch Manager Approval → Pending Funds Confirmation
      → Pending Driver Assignment → Ready for Trip → Completed
```

with rejection branches at each approval stage and `Cancelled` available from
any non-terminal state.

### Demo accounts

All demo passwords are `demo123`.

| Email | Role |
| --- | --- |
| `applicant@trs.org` | Applicant |
| `costcenter@trs.org` | Head of Cost Center |
| `branchmanager@trs.org` | Branch Manager |
| `accountant@trs.org` | Accountant |
| `reception@trs.org` | Receptionist |
| `admin@trs.org` | Administrator |

The seed also creates three more applicants — `david.brown@example.org`,
`emily.davis@example.org` and `robert.kimani@example.org` — because the
sample requests were raised by people outside the six accounts above.

---

## Project layout

```
app/                     Next.js routes (route groups mirror the screens)
├── (app)/               the signed-in area
├── api/                 route handlers
└── login/
prisma/
├── schema.prisma        the whole data model
├── migrations/          applied migrations
└── seed.ts              demo data loader
src/
├── components/          shared UI (signature upload, layout, tables)
├── context/             auth context
├── data/                demo reference data, fleet, users, seed requests
├── generated/prisma/    generated client (git-ignored)
├── hooks/               data hooks (useRequests, useFleet, ...)
├── layouts/             app shell
├── lib/                 prisma client, navigation shim
├── screens/             routed screens (requests, approvals, reception, admin)
├── services/            localStorage-backed services
└── utils/               status config, access rules, formatters
docs/
└── backend-overview.md  the domain map
```
