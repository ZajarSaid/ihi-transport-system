import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'

/**
 * Auth.js v5 configuration.
 *
 * Sessions
 * --------
 * The session strategy is `jwt`, not `database`. Auth.js refuses to combine
 * a database session with a credentials-only provider set:
 *
 *   UnsupportedStrategy: "Signing in with credentials only supported if JWT
 *   strategy is enabled"
 *
 * (node_modules/@auth/core/lib/utils/assert.js). The `Session` table stays in
 * the schema for the email/OAuth provider that will replace passwords later.
 *
 * The Prisma adapter is wired up now so that switching to a real provider
 * later is a one-line change. It is inert while credentials is the only
 * provider.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(
    prisma as unknown as Parameters<typeof PrismaAdapter>[0],
  ),
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Email and password',
      credentials: {
        email: { label: 'Email address', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim().toLowerCase()
        const password = String(credentials?.password ?? '')
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const valid = await compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title ?? '',
        }
      },
    }),
  ],
  callbacks: {
    /**
     * The role and the title are written into the token on sign-in and read
     * back out of it on every request, so the client never has to ask the
     * database who the user is.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.title = user.title ?? ''
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? ''
        session.user.role = (token.role as string) ?? 'applicant'
        session.user.title = (token.title as string) ?? ''
      }
      return session
    },
  },
})
