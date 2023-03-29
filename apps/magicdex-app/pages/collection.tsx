import { CardsTable } from '@/components'
import { useUserCards } from '@/services/hooks'
import { Center, Stack, Text } from '@mantine/core'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]'


// TODO: all this

export default function CollectionPage() {
  const { cards, isLoading, error } = useUserCards()

  return (
    <Center>
      <Stack>
        <Text weight={500}>
          Available card info:
        </Text>

        <CardsTable
          cards={cards}
          isLoading={isLoading}
          error={error}
        />
      </Stack>
    </Center>
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
