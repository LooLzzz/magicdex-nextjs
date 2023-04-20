import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import jwt from 'jsonwebtoken'
import NextAuth, { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import GitHubProvider from 'next-auth/providers/github'
import GitLabProvider from 'next-auth/providers/gitlab'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'


export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),

  providers: [
    ...(
      // Only enable GoogleProvider if credentials are set.
      // Credentials are not available while developing locally,
      // but should be already set in production (on vercel.com)
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? [GoogleProvider({
          allowDangerousEmailAccountLinking: true,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
        : []
    ),
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
      // add user id to session
      if (session?.user)
        session.user.id = user.id

      // add supabase access token to session - used for supabase RLS
      const signingSecret = process.env.SUPABASE_JWT_SECRET
      if (signingSecret)
        session.supabaseAccessToken = jwt.sign(
          {
            aud: 'authenticated',
            exp: Math.floor(new Date(session.expires).getTime() / 1000),
            sub: user.id,
            email: user.email,
            role: 'authenticated',
          },
          signingSecret
        )

      return session
    },
  },
}

export default NextAuth(authOptions)
