import { authOptions } from '@/api/auth/[...nextauth]'
import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { signOut } from 'next-auth/react'


export default function LogoutPage() {
  signOut({ callbackUrl: '/' })
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      session,
    },
  }
}
