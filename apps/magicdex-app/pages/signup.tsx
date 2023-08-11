import { authOptions } from '@/api/auth/[...nextauth]'
import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'


export default function SignupPage() {
  // TODO: implement signup
  return <>im signup</>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}
