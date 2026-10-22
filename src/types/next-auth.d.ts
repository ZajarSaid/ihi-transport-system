import type { DefaultSession } from 'next-auth'

/**
 * The session carries the two fields the UI needs beyond the default ones:
 * the role, which decides what the user may see, and the job title shown in
 * the top bar.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      title: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
    title?: string | null
  }
}
