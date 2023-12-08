import { ActionIcon, Avatar, Box, FileButton, Group, Input, Overlay, Text } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { IconAt, IconCalendar, IconPencil, IconUpload } from '@tabler/icons-react'
import { Session } from 'next-auth'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import useStyles from './styles'


const SUPPORTED_FILE_TYPES = (
  ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tiff', 'webp', 'heic']
    .map(v => 'image/' + v)
    .join(',')
)

export interface UserInfoHandle {
  reset: (options?: { avatar?: boolean, name?: boolean }) => void,
}

export interface UserInfoProps {
  user?: Session['user'],
  editable?: boolean,
  onNameChange?: (newName: string) => void,
  onAvatarFileChange?: (newAvatarFile: File) => void,
}

const UserInfo = forwardRef<UserInfoHandle, UserInfoProps>(
  function UserInfo(props: UserInfoProps, ref) {
    const { user = {}, editable = false, onNameChange, onAvatarFileChange } = props
    const { classes } = useStyles()
    const { name: oldName, email, image: image_url, created_at } = user
    const date_created_at = new Date(created_at ?? 0)

    const [newName, setNewName] = useState(oldName)
    const [nameEditActive, setNameEditActive] = useState(false)
    const newNameRef = useClickOutside(() => setNameEditActive(false))

    const [avatarFile, setAvatarFile] = useState<File>(null)
    const [avatarHover, setAvatarHover] = useState(false)

    useImperativeHandle(ref, () => ({
      reset: ({ avatar: resetAvatar = true, name: resetName = true } = {}) => {
        setNameEditActive(false)
        if (resetName) {
          setNewName(oldName)
        }
        if (resetAvatar) {
          setAvatarFile(null)
          setAvatarHover(false)
        }
      },
    }), [oldName, setNewName, setNameEditActive, setAvatarFile, setAvatarHover])

    const handleOnNameTextClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (e.detail === 1) {
        setNameEditActive(v => !v)
        setTimeout(() => newNameRef?.current?.focus(), 100)
      }
    }

    const handleOnNameTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Enter':
          setNameEditActive(false)
          break

        case 'Escape':
          setNewName(oldName)
          setNameEditActive(false)
          break
      }
    }

    useEffect(() => {
      onNameChange?.(newName)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newName])

    useEffect(() => {
      onAvatarFileChange?.(avatarFile)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avatarFile])

    return (
      <Group noWrap>
        <Box pos='relative'>
          <Avatar
            src={avatarFile ? URL.createObjectURL(avatarFile) : image_url}
            size={94}
            radius='md'
            onMouseEnter={() => setAvatarHover(true)}
          />
          {avatarHover && (
            <Overlay
              center
              blur={1}
              radius='md'
              onMouseLeave={() => setAvatarHover(false)}
            >
              <FileButton onChange={setAvatarFile} accept={SUPPORTED_FILE_TYPES}>
                {
                  props => (
                    <ActionIcon {...props} w='100%' h='100%'>
                      <IconUpload />
                    </ActionIcon>
                  )
                }
              </FileButton>
            </Overlay>
          )}
        </Box>

        <div>
          {
            nameEditActive
              ? (
                <Input
                  ref={newNameRef}
                  size='lg'
                  variant='unstyled'
                  placeholder={oldName}
                  classNames={{ input: classes.nameInput }}
                  onChange={e => setNewName(e.currentTarget?.value)}
                  onKeyDown={handleOnNameTextKeyDown}
                />
              ) : (
                <Group noWrap spacing='xs' position='left'>
                  <Text
                    fz='lg'
                    fw={500}
                    title='Name'
                    className={classes.name}
                    onClick={e => editable && handleOnNameTextClick(e)}
                  >
                    {newName || oldName}
                  </Text>
                  <IconPencil
                    color='grey'
                    size='1.3em'
                    className={classes.iconPencil}
                  />
                </Group>
              )
          }

          <Group noWrap spacing={10} mt={3}>
            <IconAt stroke={1.5} size='1rem' className={classes.icon} />
            <Text fz='xs' c='dimmed' title='Email'>
              {email}
            </Text>
          </Group>

          <Group noWrap spacing={10} mt={5}>
            <IconCalendar stroke={1.5} size='1rem' className={classes.icon} />
            <Text fz='xs' c='dimmed' title='Member Since'>
              {date_created_at.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </Group>
        </div>
      </Group>
    )
  }
)
export default UserInfo
