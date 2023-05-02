import { CardImage, CardsTable } from '@/components'
import { UserCardData } from '@/types/supabase'
import { ActionIcon, Affix, Container, Grid, Stack, Tooltip, rem } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconFileExport, IconFilePlus } from '@tabler/icons-react'
import { MRT_Row } from 'mantine-react-table'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { authOptions } from '../api/auth/[...nextauth]'


export default function CollectionPage() {
  const router = useRouter()
  const isSmallerThanLg = useMediaQuery('(max-width: 1100px)', false)
  const [hoveredRow, setHoveredRow] = useState<MRT_Row<UserCardData>>()

  function handleExportClick() {
    router.push('/collection/export')
  }

  function handleImportClick() {
    router.push('/collection/import')
  }

  return (
    <>
      <Affix position={{ right: rem(20), bottom: rem(20) }}>
        <Tooltip.Group openDelay={250} closeDelay={100}>
          <Stack spacing='xs'>
            <Tooltip label='Export Cards' position='left' transitionProps={{ transition: 'pop-top-right' }}>
              <ActionIcon radius='md' size='lg' variant='filled' color={null} onClick={handleExportClick}>
                <IconFileExport />
              </ActionIcon>
            </Tooltip>
            <Tooltip label='Import Cards' position='left' transitionProps={{ transition: 'pop-top-right' }}>
              <ActionIcon radius='md' size='lg' variant='filled' color={null} onClick={handleImportClick}>
                <IconFilePlus />
              </ActionIcon>
            </Tooltip>
          </Stack>
        </Tooltip.Group>
      </Affix>

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
    </>
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
