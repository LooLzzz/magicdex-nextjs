import { authOptions } from '@/api/auth/[...nextauth]'
import { Container } from '@mantine/core'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'


export default function CollectionExportPage() {
  return (
    <Container size='xl'>
      CollectionExportPage
    </Container>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  // If the user is not logged in, redirect.
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  return {
    props: {
      session,
    }
  }
}
