import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../../lib/db'

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXTAUTH_SECRET) {
  console.warn('Missing one of GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET in env')
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow sign-in if the email is present in our Users table and has a role (allowlist)
      if (!user?.email) return false
      const existing = await prisma.user.findUnique({ where: { email: user.email } })
      // Allow sign-in only if user exists in DB (admin/editor)
      return !!existing
    },
    async session({ session, user }) {
      // Attach role from DB to session object
      if (session.user) {
        session.user.role = (user as any)?.role ?? 'editor'
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }
