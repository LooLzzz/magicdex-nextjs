import { authOptions } from '@/api/auth/[...nextauth]'
import { AuthErrorText, AuthProviderIcon, FloatingLabelPasswordInput, FloatingLabelTextInput } from '@/components'
import { Box, Button, Container, Divider, Group, LoadingOverlay, Stack, Title, rem } from '@mantine/core'
import { isEmail, useForm } from '@mantine/form'
import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { CommonProviderOptions } from 'next-auth/providers'
import { getProviders, signIn } from 'next-auth/react'
import { useState } from 'react'


export default function LoginPage({
  providers,
  query: { error: queryError, ...query }
}: {
  providers: { [key: string]: CommonProviderOptions }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: { [key: string]: any }
}) {
  const [loginError, setLoginError] = useState(queryError)
  const [loadingOverlayVisible, setLoadingOverlay] = useState(false)

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: isEmail('Invalid email address'),
    },
  })

  const handleSubmit = async (values) => {
    setLoadingOverlay(true)
    form.setValues({ password: '' })
    await signIn('credentials',
      {
        email: values.email,
        password: values.password,
        callbackUrl: '/collection',
      })
  }

  const handleReset = (event) => {
    setLoginError('')
    form.reset()
  }

  return (
    <Container>
      <Box maw={rem(300)} mx='auto' pos='relative' p={10} pt={5}>
        <Stack>
          <Title sx={{ paddingBottom: rem(7.5) }}>
            Login
          </Title>

          <LoadingOverlay
            visible={loadingOverlayVisible}
            overlayBlur={1.75}
            radius='sm'
          />
          <form
            onSubmit={(event) => { setLoginError(''); form.onSubmit(handleSubmit)(event) }}
            onReset={handleReset}
          >
            <Stack spacing='xl'>
              <FloatingLabelTextInput required
                id='email'
                label='Email'
                type='email'
                {...form.getInputProps('email')}
              />
              <FloatingLabelPasswordInput required
                label='Password'
                {...form.getInputProps('password')}
              />
              {
                loginError
                  ? <AuthErrorText
                    errorType={loginError}
                    color='red'
                    size='sm'
                  />
                  : null
              }
            </Stack>
            <Group position='right' mt='md'>
              <Button type='reset' variant='default'>
                Reset
              </Button>
              <Button type='submit'>
                Submit
              </Button>
            </Group>
          </form>

          <Divider
            label='or'
            labelPosition='center'
          />

          <Stack>
            {
              Object.values(providers || {}).filter(provider => provider.id !== 'credentials').map(provider => (
                <Button
                  key={provider.id}
                  onClick={() => {
                    setLoginError('')
                    setLoadingOverlay(true)
                    signIn(provider.id, { callbackUrl: '/collection' })
                  }}
                  sx={{
                    boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
                    root: {
                      paddingLeft: rem(5),
                    },
                    label: {
                      flex: 1,
                      justifyContent: 'center'
                    },
                    leftIcon: {
                      height: '100%',
                      margin: 0,
                    },
                  }}
                  leftIcon={
                    <>
                      <AuthProviderIcon providerId={provider.id} size={rem(20)} />
                      <Divider
                        orientation='vertical'
                        sx={(theme) => ({
                          marginLeft: rem(5),
                          borderColor: (
                            theme.colorScheme === 'dark'
                              ? theme.colors.dark[5]
                              : theme.colors.gray[5]
                          ),
                        })}
                      />
                    </>
                  }
                >
                  Login with {provider.name}
                </Button>
              ))
            }
          </Stack>
        </Stack>
      </Box>
    </Container>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  // If the user is already logged in, redirect.
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
      query: context.query,
      providers: (await getProviders()) || [],
    }
  }
}
