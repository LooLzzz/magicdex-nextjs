import { getUserByCredentials } from '@/api/(services)/userServices'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import { getCookie, setCookie } from 'cookies-next'
import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth, { NextAuthOptions } from 'next-auth'
import { decode as nextAuthJwtDecode, encode as nextAuthJwtEncode } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'
import GitHubProvider from 'next-auth/providers/github'
import GitLabProvider from 'next-auth/providers/gitlab'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'
import { v4 as uuidv4 } from 'uuid'


export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),

  pages: {
    signIn: '/login',
    signOut: '/logout',
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async credentials => {
        return await getUserByCredentials(credentials)
      },
    }),
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(
    req,
    res,
    {
      ...authOptions,

      /// Customize the JWT encode and decode functions to overwrite the default behaviour of
      /// storing the JWT token in the session cookie when using credentials providers.
      /// Instead we will store the session token reference to the session in the database.
      jwt: {
        encode: async ({ token, secret, maxAge }) => {
          if (req.method === 'POST'
            && req.query.nextauth.includes('callback')
            && req.query.nextauth.includes('credentials')) {
            const sessionCookie = getCookie(
              'next-auth.session-token',
              { req, res }
            )
            return sessionCookie as string || ''
          }

          // Revert to default behaviour when not in the credentials provider callback flow
          return await nextAuthJwtEncode({ token, secret, maxAge })
        },

        decode: async ({ token, secret }) => {
          if (req.method === 'POST'
            && req.query.nextauth.includes('callback')
            && req.query.nextauth.includes('credentials')) {
            return null
          }

          // Revert to default behaviour when not in the credentials provider callback flow
          return await nextAuthJwtDecode({ token, secret })
        }
      },

      callbacks: {
        ...authOptions?.callbacks,

        /// Check if this sign in callback is being called in the credentials authentication flow.
        /// If so, use the next-auth adapter to create a session entry in the database.
        /// 'signIn()' is called after authorize so we can safely assume the user is valid and already authenticated.
        signIn: async ({ user }) => {
          if (req.method === 'POST'
            && req.query.nextauth.includes('callback')
            && req.query.nextauth.includes('credentials')) {
            if (user) {
              const sessionToken = uuidv4()
              const sessionExpiry = new Date(
                new Date().setMonth(
                  new Date().getMonth() + 1
                )
              )

              await authOptions.adapter.createSession({
                sessionToken: sessionToken,
                userId: user.id,
                expires: sessionExpiry
              })

              setCookie(
                'next-auth.session-token',
                sessionToken,
                {
                  maxAge: Math.round(
                    sessionExpiry.getTime() - new Date().getTime() / 1000
                  ),
                  req,
                  res,
                }
              )
            }
          }
          return true
        },
      }
    })
}

// export default NextAuth(authOptions)
const nextAuthAdapter = authOptions.adapter
export {
  nextAuthAdapter
}
