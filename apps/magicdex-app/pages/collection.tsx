import { cardServices } from '@/services/firestore'
import { Card } from '@/services/firestore/types'
import { Center, Code, Stack, Text, Title } from '@mantine/core'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import React from 'react'
import { authOptions } from './api/auth/[...nextauth]'


// TODO: all this
// TODO: need to choose between ServerSideRendering (with getServerSideProps) and ClientSideRendering (with useSWR)

export default function CollectionPage({ cards = [] }: { cards: Card[] }) {

  return (
    <Center>
      <Stack>
        <Text weight={500}>
          Available card info:
        </Text>

        <Text>
          {
            cards.length > 0
              ? <ul>
                {cards.map(card => (
                  <li key={card.id}>
                    {Object.keys(card).sort().map(key => (
                      <React.Fragment key={key}>
                        {key}: <Code>{card[key]}</Code>
                        <br />
                      </React.Fragment>
                    ))}
                  </li>
                ))}
              </ul>
              : <Title order={3}>No cards found</Title>
          }
        </Text>
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
      cards: await cardServices.getCardsDataByUserId(session.user.id),
    }
  }
}
