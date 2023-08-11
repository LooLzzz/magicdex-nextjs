import { authOptions } from '@/api/auth/[...nextauth]'
import { FloatingLabelPasswordInput, UserInfo } from '@/components'
import { UserInfoHandle } from '@/components/UserInfo'
import { imgbb, users as usersService } from '@/services'
import { compactObject, getImageDimensionsFromFile } from '@/utils'
import { Accordion, Box, Button, Container, Divider, Group, LoadingOverlay, Space, Stack, Text, Title, rem } from '@mantine/core'
import { hasLength, matchesField, useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useRef, useState } from 'react'
import uuid4 from 'uuid4'


const MAX_AVATAR_FILE_SIZE_MB = 32
const MAX_AVATAR_DIMENSIONS_PX = 80

export default function ProfilePage() {
  const session = useSession()
  const user = session?.data?.user
  const userInfoRef = useRef<UserInfoHandle>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false)

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      avatarFile: null,
      newName: '',
    },

    validate: {
      confirmPassword: matchesField('newPassword', 'Passwords do not match'),
      newPassword: (value, { currentPassword }) => (
        value?.length > 0 && value.length < 8
          ? 'Password must be at least 8 characters long'
          : value === currentPassword
            ? 'New password must be different from current password'
            : null
      ),
      newName: value => {
        value = value?.trim()
        return (
          value?.length > 0
            ? hasLength({ min: 3, max: 32 }, 'Name must be between 3 and 32 characters long')(value)
            : null
        )
      },

      avatarFile: (value: File) => {
        if (value?.size > MAX_AVATAR_FILE_SIZE_MB * 1024 * 1024) {
          return `Image must be less than ${MAX_AVATAR_FILE_SIZE_MB}MB`
        }
        if (value) {
          getImageDimensionsFromFile(value)
            .then(({ width, height }) => {
              if (width < MAX_AVATAR_DIMENSIONS_PX || height < MAX_AVATAR_DIMENSIONS_PX) {
                setErrorMessage(`Image must be at least ${MAX_AVATAR_DIMENSIONS_PX}x${MAX_AVATAR_DIMENSIONS_PX} pixels`)
                userInfoRef.current?.reset({ avatar: true })
              }
              else if (width !== height) {
                setErrorMessage('Image must be square')
                userInfoRef.current?.reset({ avatar: true })
              }
              else {
                setErrorMessage('')
              }
            })
        }
        return null
      },
    },

    transformValues: ({ newName, ...values }) => {
      newName = newName?.trim()
      return {
        ...values,
        newName: newName === user?.name ? '' : newName,
      }
    },

    validateInputOnChange: ['avatarFile'],
    clearInputErrorOnChange: true,
  })

  const handleDelete = () => modals.openConfirmModal({
    title: 'Delete your profile',
    centered: true,
    children: (
      <Text size='sm'>
        Are you sure you want to delete your profile?
        <br />
        This action is IRREVERSIBLE!
      </Text>
    ),
    labels: { confirm: 'YEET My Account', cancel: 'Cancel' },
    confirmProps: { color: 'red', sx: { boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)' } },
    cancelProps: { variant: 'default' },
    onConfirm: async () => await usersService.deleteUser(),
  })

  const handleSubmit = async ({ currentPassword, ...values }: typeof form.values) => {
    values = compactObject(values)
    if (Object.keys(values).length === 0) {
      return
    }

    form.setFieldValue('currentPassword', '')
    setLoadingOverlayVisible(true)

    if (values.avatarFile) {
      const { data: { url: newAvatarUrl } = {} } = await imgbb.uploadImage(values.avatarFile, { name: uuid4() })
      values['newAvatarUrl'] = newAvatarUrl
    }

    try {
      await usersService.updateUser({ ...values, currentPassword })
      user.name = values?.newName || user?.name
      user.image = values?.['newAvatarUrl'] || user?.image
      setTimeout(handleReset, 100)

      notifications.show({
        title: 'Success',
        message: 'Profile updated',
        color: 'green',
      })
    }
    catch (error) {
      notifications.show({
        title: 'Error',
        message: (error as Error).message,
        color: 'red',
      })
    }
    finally {
      setLoadingOverlayVisible(false)
    }
  }

  const handleReset = () => {
    userInfoRef.current?.reset()
    form.reset()
  }

  return (
    <Container>
      <Box maw={rem(300)} mx='auto' pos='relative' p={10} pt={5}>
        <Stack spacing={0}>

          <Title pb={20}>
            My Profile
          </Title>

          <UserInfo
            editable
            ref={userInfoRef}
            user={user}
            onNameChange={newName => form.setFieldValue('newName', newName)}
            onAvatarFileChange={newAvatarFile => form.setFieldValue('avatarFile', newAvatarFile)}
          />

          {
            [errorMessage, form?.errors?.newName, form?.errors?.avatarFile]
              .filter(Boolean)
              .map((value, index) => (
                <Text key={index} color='red' size='sm'>
                  {value}
                </Text>
              ))
          }

          <LoadingOverlay
            visible={loadingOverlayVisible}
            overlayBlur={1.75}
            radius='sm'
          />
          <form
            onSubmit={event => { setErrorMessage(''); form.onSubmit(handleSubmit)(event) }}
            onReset={() => { setErrorMessage(''); handleReset() }}
          >
            <FloatingLabelPasswordInput
              required
              mt={10}
              autoComplete='current-password'
              label='Current Password'
              {...form.getInputProps('currentPassword')}
            />

            <Divider mt={20} mb={10} />

            <Title order={4} pb={2.5} pt={5}>
              Change Password
            </Title>

            <Stack spacing={7.5}>
              <FloatingLabelPasswordInput
                autoComplete='new-password'
                label='New Password'
                {...form.getInputProps('newPassword')}
              />
              <FloatingLabelPasswordInput
                autoComplete='confirm-new-password'
                label='Confirm Password'
                {...form.getInputProps('confirmPassword')}
              />
            </Stack>

            <Group position='right' mt='md'>
              <Button type='reset' variant='default'>
                Reset
              </Button>
              <Button type='submit' sx={{ boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)' }}>
                Update
              </Button>
            </Group>
          </form>

          <Space h='xl' />
          <Divider />
          <Space h='xl' />

          <Accordion>
            <Accordion.Item value='danger-zone' sx={{ borderBottom: '0px' }}>
              <Accordion.Control>DANGER ZONE</Accordion.Control>
              <Accordion.Panel sx={{ textAlign: 'center' }}>
                <Space h='sm' />
                <Button color='red' onClick={handleDelete}>
                  Delete Account
                </Button>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

        </Stack>
      </Box>
    </Container>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}
