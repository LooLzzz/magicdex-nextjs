import { Stack, Text, Title } from '@mantine/core'
import { useSession } from 'next-auth/react'
import Image from 'next/image'


// TODO: all this

export default function HomePage() {
  const session = useSession()

  return (
    <Stack align='center'>
      <Title>
        Welcome to MagicDex!
      </Title>

      <Text>
        {
          session.status === 'authenticated'
            ? `Logged in as ${session.data.user.name}`
            : 'Not currently logged in'
        }
      </Text>
    </Stack>
  )
}
