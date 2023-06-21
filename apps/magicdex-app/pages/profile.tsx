import { authOptions } from '@/api/auth/[...nextauth]'
import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'


export default function SingupPage() {
  // TODO: implement profile page:
  // - change password
  // - change user image
  // - delete account
  return <>im profile</>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/login',
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
