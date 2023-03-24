import { FloatingLabelInput } from '@/components'
import { Box, Button, Group, LoadingOverlay, Stack, Text } from '@mantine/core'
import { hasLength, matchesField, useForm } from '@mantine/form'
import { useState } from 'react'


export default function SignupPage() {
  const [signupError, setSignupError] = useState('')
  const [loadingOverlayVisible, setLoadingOverlay] = useState(false)

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      password: hasLength({ min: 8 }, 'Password must be at least 8 characters long'),
      confirmPassword: matchesField('password', 'Passwords do not match')
    },

    validateInputOnChange: [
      'password',
      'confirmPassword'
    ],
  })

  const handleSubmit = async (values) => {
    // TODO: handle signup
    setLoadingOverlay(true)
    await new Promise(resolve => setTimeout(() => {
      setLoadingOverlay(false)
      resolve(null)
    }, 2000))

    console.log(values)
    setSignupError('Signup is not implemented yet')
    form.setValues({
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <Box maw={320} pos='relative' mx='auto' p={10} pt={25}>
      <LoadingOverlay
        visible={loadingOverlayVisible}
        overlayBlur={1.75}
        radius='sm'
      />

      <form
        onSubmit={(event) => { setSignupError(''); form.onSubmit(handleSubmit)(event) }}
        onReset={(event) => { setSignupError(''); form.onReset(event) }}
      >
        <Stack spacing='xl'>
          <FloatingLabelInput required
            id='username'
            label='Username'
            autoComplete='off'
            {...form.getInputProps('username')}
          />

          <FloatingLabelInput password required
            autoComplete='new-password'
            label='Password'
            {...form.getInputProps('password')}
          />

          <FloatingLabelInput password
            autoComplete='new-password'
            label='Confirm Password'
            {...form.getInputProps('confirmPassword')}
          />

          {
            signupError
              ? <Text color='red' size='sm'>
                {signupError}
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
