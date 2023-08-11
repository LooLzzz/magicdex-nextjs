import { authOptions } from '@/api/auth/[...nextauth]'
import { ImportBulk, ImportWebcam, ImportWizard } from '@/components/ImportComponents'
import { Box, Center, Container, SegmentedControl, rem } from '@mantine/core'
import { IconCodeDots, IconVideo, IconWand } from '@tabler/icons-react'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { useRouter } from 'next/router'
import { useMemo } from 'react'


export default function CollectionImportPage({ importVariant }: { importVariant?: 'bulk' | 'webcam' | 'wizard' }) {
  const router = useRouter()

  const ImportComponent = useMemo(
    () => {
      switch (importVariant) {
        case 'bulk':
          return ImportBulk
        case 'webcam':
          return ImportWebcam
        default /* wizard */:
          return ImportWizard
      }
    },
    [importVariant]
  )

  return (
    <Container pos='relative' size='xl'>
      <Box pos='absolute' top={0} right={0}>
        <SegmentedControl
          data={[
            { value: 'wizard', label: <span title='Import Wizard'><IconWand /></span> },
            { value: 'bulk', label: <span title='Bulk Import'><IconCodeDots /></span> },
            { value: 'webcam', label: <span title='Webcam Import'><IconVideo /></span> },
          ]}
          value={importVariant}
          onChange={value => router.push(`/collection/import/${value}`)}
        />
      </Box>

      <Center py={rem(60)}>
        <ImportComponent />
      </Center>
    </Container>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)
  const importVariant = context.params?.variant?.[0]

  // If the user is not logged in, redirect.
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  if (!importVariant) {
    return {
      redirect: {
        destination: '/collection/import/wizard',
        permanent: false,
      }
    }
  }

  return {
    props: {
      importVariant,
    }
  }
}
