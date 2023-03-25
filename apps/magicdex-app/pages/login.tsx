import { authOptions } from '@/api/auth/[...nextauth]'
import { FloatingLabelInput } from '@/components'
import { Box, Button, Divider, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { CommonProviderOptions } from 'next-auth/providers'
import { getProviders, signIn } from 'next-auth/react'
import { useState } from 'react'


// export default function LoginPage() {
//   return (
//     <>
//       <Button onClick={signIn}>
//         Login
//       </Button>
//     </>
//   )
// }

export default function LoginPage({
  providers
}: {
  providers: { [key: string]: CommonProviderOptions }
}) {
  const [loginError, setLoginError] = useState('')
  const [loadingOverlayVisible, setLoadingOverlay] = useState(false)

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    }
  })

  const handleSubmit = async (values) => {
    // TODO: handle login
    setLoadingOverlay(true)

    await new Promise(resolve => setTimeout(() => {
      setLoadingOverlay(false)
      resolve(null)
    }, 2000))
    console.log(values)
    setLoginError('Login is not implemented yet')

    form.setValues({ password: '' })
  }

  return (
    <Box maw={320} pos='relative' mx='auto' p={10} pt={25}>
      <Stack>
        <Title>
          Login
        </Title>

        <LoadingOverlay
          visible={loadingOverlayVisible}
          overlayBlur={1.75}
          radius='sm'
        />
        <form
          onSubmit={(event) => { setLoginError(''); form.onSubmit(handleSubmit)(event) }}
          onReset={(event) => { setLoginError(''); form.onReset(event) }}
        >
          <Stack spacing='xl'>
            <FloatingLabelInput required
              id='username'
              label='Username'
              {...form.getInputProps('username')}
            />
            <FloatingLabelInput password required
              label='Password'
              {...form.getInputProps('password')}
            />
            {
              loginError
                ? <Text color={'red'} size='sm'>
                  {loginError}
                </Text>
                : null
            }
          </Stack>
          <Group position='right' mt='md'>
            <Button type='reset' variant='default'>Reset</Button>
            <Button type='submit'>Submit</Button>
          </Group>
        </form>

        <Divider />

        <Stack>
          <Title order={3}>
            Login with Socials
          </Title>
          {Object.values(providers || {}).map(provider => (
            <Button key={provider.id} onClick={() => signIn(provider.id)}>
              {provider.name}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  return {
    props: {
      session,
      providers: (await getProviders()) || [],
    }
  }
}
