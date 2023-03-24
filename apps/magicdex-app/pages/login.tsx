import { FloatingLabelInput } from '@/components'
import { Box, Button, Group, LoadingOverlay, Stack, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'


export default function LoginPage() {
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
    </Box >
  )
}
