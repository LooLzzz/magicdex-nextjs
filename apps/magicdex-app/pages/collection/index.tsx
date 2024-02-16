import { authOptions } from '@/api/auth/[...nextauth]'
import { CardImage, CardsTable } from '@/components'
import { useCollectionStore } from '@/store'
import { UserCardData } from '@/types/supabase'
import { ActionIcon, Affix, Container, Grid, Stack, Tooltip, rem } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconFileExport, IconFilePlus } from '@tabler/icons-react'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { useRouter } from 'next/router'


export default function CollectionPage() {
  const router = useRouter()
  const isSmallerThanLg = useMediaQuery('(max-width: 1225px)', false)
  const { stagingAreaCard, selectedRowCard } = useCollectionStore()

  const handleExportClick = () => {
    router.push('/collection/export')
  }

  const handleImportClick = () => {
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
              displayTransform
              displayPrice
              shouldTransfromTranslateImage={false}
              card={{
                ...selectedRowCard,
                ...stagingAreaCard,
              } as UserCardData}
              aspectRatioProps={{
                maw: CardImage.defaultWidth,
                miw: CardImage.defaultWidth,
              }}
              style={{
                top: rem(20),
                position: 'sticky'
              }}
            />
          </Grid.Col>

          <Grid.Col span={isSmallerThanLg ? 12 : 9} offset={0.2}>
            <CardsTable />
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
    props: {}
  }
}
