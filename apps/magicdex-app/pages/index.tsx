import { Container, Stack, Text, Title } from '@mantine/core'
import { useSession } from 'next-auth/react'


// TODO: create an actual homepage

export default function HomePage() {
  const session = useSession()

  return (
    <Container>
      <Stack align='center'>
        <Title>
          Welcome to MagicDex!
        </Title>

        <Text>
          {
            session.status === 'authenticated'
              ? <>
                <Text weight={600}>
                  Available session user data:
                </Text>
                <ul>
                  {Object.entries(session.data.user).map(([key, value]) => (
                    <li key={key}>
                      <Text>
                        {`${key}: ${value}`}
                      </Text>
                    </li>
                  ))}
                </ul>
              </>
              : 'Not currently logged in'
          }
        </Text>
      </Stack>
    </Container>
  )
}
