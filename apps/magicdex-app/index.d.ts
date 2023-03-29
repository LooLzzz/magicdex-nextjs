import { Session as DefaultSession } from 'next-auth'


/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any
  export const ReactComponent: any
  export default content
}


declare module 'next-auth' {
  export interface Session extends DefaultSession {
    user: {
      id?: string
      name?: string
      email?: string
      image?: string
    }
  }
}
