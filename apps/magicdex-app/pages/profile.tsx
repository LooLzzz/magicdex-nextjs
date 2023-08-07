import { authOptions } from '@/api/auth/[...nextauth]'
import { Center, List, Stack, Text } from '@mantine/core'
import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'


export default function ProfilePage() {
  return (
    <Center>
      <Stack>
        <Text>
          TODO: implement profile page:
        </Text>
        <List>
          <List.Item>change password</List.Item>
          <List.Item>change user image</List.Item>
          <List.Item>delete account</List.Item>
        </List>
      </Stack>
    </Center>
  )
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
