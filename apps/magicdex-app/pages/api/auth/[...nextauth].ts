import { firestore } from '@/services'
import { FirestoreAdapter } from '@next-auth/firebase-adapter'
import NextAuth, { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import GitHubProvider from 'next-auth/providers/github'
import GitLabProvider from 'next-auth/providers/gitlab'
import LinkedInProvider from 'next-auth/providers/linkedin'


export const authOptions: NextAuthOptions = {
  adapter: FirestoreAdapter(firestore),

  providers: [
    GitHubProvider({
      allowDangerousEmailAccountLinking: true,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GitLabProvider({
      allowDangerousEmailAccountLinking: true,
      clientId: process.env.GITLAB_CLIENT_ID,
      clientSecret: process.env.GITLAB_CLIENT_SECRET,
    }),
    LinkedInProvider({
      allowDangerousEmailAccountLinking: true,
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
    DiscordProvider({
      allowDangerousEmailAccountLinking: true,
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user)
        session.user['id'] = user.id
      return session
    },
  },
}

export default NextAuth(authOptions)
