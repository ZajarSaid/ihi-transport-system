export const ROLES = {
  APPLICANT: 'applicant',
  COST_CENTER: 'cost_center',
  BRANCH_MANAGER: 'branch_manager',
  ACCOUNTANT: 'accountant',
  RECEPTIONIST: 'receptionist',
  ADMIN: 'admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export type RoleMeta = {
  label: string
  home: string
  accent: string
  description: string
}

export const ROLE_META: Record<Role, RoleMeta> = {
  [ROLES.APPLICANT]: {
    label: 'Applicant',
    home: '/requests',
    accent: '#8b5cf6',
    description: 'Create and submit transport requests.',
  },
  [ROLES.COST_CENTER]: {
    label: 'Head of Cost Center',
    home: '/approvals/cost-center',
    accent: '#ec4899',
    description: 'Approve requests for your cost center.',
  },
  [ROLES.BRANCH_MANAGER]: {
    label: 'Branch Manager',
    home: '/approvals/branch-manager',
    accent: '#f97316',
    description: 'Review cost-center-approved requests.',
  },
  [ROLES.ACCOUNTANT]: {
    label: 'Accountant',
    home: '/approvals/accountant',
    accent: '#0ea5e9',
    description: 'Confirm funds availability.',
  },
  [ROLES.RECEPTIONIST]: {
    label: 'Receptionist',
    home: '/reception',
    accent: '#10b981',
    description: 'Assign drivers and print forms.',
  },
  [ROLES.ADMIN]: {
    label: 'Administrator',
    home: '/admin',
    accent: '#ef4444',
    description: 'Oversee all requests and system data.',
  },
}

export const ROLE_HOME: Record<Role, string> = Object.fromEntries(
  Object.entries(ROLE_META).map(([role, meta]) => [role, meta.home]),
) as Record<Role, string>

/**
 * Which roles may open which area of the app. The entries are matched as
 * path prefixes.
 *
 * `/requests` is deliberately absent: the receptionist opens the print view
 * from there (`/requests/:id/print`), and the screens themselves filter the
 * list by ownership, so the area stays open to every signed-in user.
 */
export const ROUTE_ACCESS: { prefix: string; roles: Role[] }[] = [
  { prefix: '/approvals/cost-center', roles: [ROLES.COST_CENTER, ROLES.ADMIN] },
  {
    prefix: '/approvals/branch-manager',
    roles: [ROLES.BRANCH_MANAGER, ROLES.ADMIN],
  },
  { prefix: '/approvals/accountant', roles: [ROLES.ACCOUNTANT, ROLES.ADMIN] },
  { prefix: '/reception', roles: [ROLES.RECEPTIONIST, ROLES.ADMIN] },
  { prefix: '/admin', roles: [ROLES.ADMIN] },
]

export function roleLabel(role?: string): string {
  return ROLE_META[role as Role]?.label || 'User'
}

export function initials(name = ''): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export type DemoUser = {
  id: string
  name: string
  email: string
  password: string
  role: Role
  title: string
}

export const demoUsers: DemoUser[] = [
  {
    id: 'u-applicant',
    name: 'Jane Smith',
    email: 'applicant@trs.org',
    password: 'demo123',
    role: ROLES.APPLICANT,
    title: 'Transport Applicant',
  },
  {
    id: 'u-cost-center',
    name: 'Dr. Amina Yusuf',
    email: 'costcenter@trs.org',
    password: 'demo123',
    role: ROLES.COST_CENTER,
    title: 'Head of Cost Center',
  },
  {
    id: 'u-branch-manager',
    name: 'James Kariuki',
    email: 'branchmanager@trs.org',
    password: 'demo123',
    role: ROLES.BRANCH_MANAGER,
    title: 'Branch Manager',
  },
  {
    id: 'u-accountant',
    name: 'Grace Wanjiru',
    email: 'accountant@trs.org',
    password: 'demo123',
    role: ROLES.ACCOUNTANT,
    title: 'Project Accountant',
  },
  {
    id: 'u-receptionist',
    name: 'Peter Otieno',
    email: 'reception@trs.org',
    password: 'demo123',
    role: ROLES.RECEPTIONIST,
    title: 'Receptionist',
  },
  {
    id: 'u-admin',
    name: 'System Admin',
    email: 'admin@trs.org',
    password: 'demo123',
    role: ROLES.ADMIN,
    title: 'System Administrator',
  },
]
