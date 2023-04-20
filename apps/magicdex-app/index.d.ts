import { DefaultSession } from 'next-auth'


/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any
  export const ReactComponent: any
  export default content
}


declare module 'next-auth' {
  interface Session extends DefaultSession {
    supabaseAccessToken?: string
    user: DefaultSession['user'] & { id?: string }
  }
}
