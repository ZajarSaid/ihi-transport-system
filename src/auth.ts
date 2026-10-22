/**
 * The public entry point for authentication.
 *
 * Import from here rather than from `src/lib/auth` so that the location of
 * the Auth.js configuration can change without touching every caller.
 */
export { handlers, auth, signIn, signOut } from './lib/auth'
