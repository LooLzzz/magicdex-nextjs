import { authOptions } from '@/api/auth/[...nextauth]'
import { ImportBulk, ImportWebcam, ImportWizard } from '@/components/ImportComponents'
import { Box, Center, Container, SegmentedControl, rem } from '@mantine/core'
import { IconCodeDots, IconVideo, IconWand } from '@tabler/icons-react'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { useState } from 'react'


export default function CollectionImportPage() {
  const [activeView, setActiveView] = useState('wizard')

  return (
    <Container pos='relative' size='xl'>
      <Box pos='absolute' top={0} right={0}>
        <SegmentedControl
          data={[
            { value: 'wizard', label: <span title='Import Wizard'><IconWand /></span> },
            { value: 'bulk', label: <span title='Bulk Import'><IconCodeDots /></span> },
            { value: 'webcam', label: <span title='Webcam Import'><IconVideo /></span> },
          ]}
          value={activeView}
          onChange={setActiveView}
        />
      </Box>

      <Center py={rem(60)}>
        {
          (() => {
            switch (activeView) {
              case 'wizard':
                return <ImportWizard />
              case 'bulk':
                return <ImportBulk />
              case 'webcam':
                return <ImportWebcam />
            }
          })()
        }
      </Center>
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
