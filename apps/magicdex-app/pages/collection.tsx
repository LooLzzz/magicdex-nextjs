import { CardImage, CardsTable } from '@/components'
import { UserCardData } from '@/types/supabase'
import { Container, Grid, rem } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { MRT_Row } from 'mantine-react-table'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { useState } from 'react'
import { authOptions } from './api/auth/[...nextauth]'


export default function CollectionPage() {
  const [hoveredRow, setHoveredRow] = useState<MRT_Row<UserCardData>>()
  const isSmallerThanLg = useMediaQuery('(max-width: 1100px)', false)

  return (
    <Container fluid>
      <Grid>

        <Grid.Col offset={0.3} span={2} hidden={isSmallerThanLg}>
          <CardImage
            card={hoveredRow?.original}
            aspectRatioProps={{
              maw: CardImage.defaultWidth,
              miw: CardImage.defaultWidth * 0.8,
            }}
            style={{
              top: rem(20),
              position: 'sticky'
            }}
          />
        </Grid.Col>

        <Grid.Col span={isSmallerThanLg ? 12 : 9} offset={0.2}>
          <CardsTable
            onHoveredRowChange={setHoveredRow}
          />
        </Grid.Col>

      </Grid>
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
