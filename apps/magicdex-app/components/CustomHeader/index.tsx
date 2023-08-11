import { navbarRoutes } from '@/routes'
import {
  Avatar,
  Box,
  Burger,
  Container,
  Divider,
  Drawer,
  Group,
  Header,
  Image,
  Menu,
  rem,
  ScrollArea,
  useMantineColorScheme
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconMoonFilled, IconSunFilled } from '@tabler/icons-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import LoginLogoutButtons from './LoginLogoutButtons'
import NavbarLink from './NavbarLink'
import useStyles from './styles'


export default function CustomHeader({
  headerHeight = 60
}: {
  headerHeight?: number
}) {
  const session = useSession()
  const router = useRouter()
  const { classes, cx } = useStyles()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isUserAuthenticated = session.status === 'authenticated'

  const [avatarIconHovering, setAvatarIconHovering] = useState(false)
  const [menuOpened, setMenuOpened] = useState(false)
  const [
    drawerOpened,
    {
      toggle: toggleDrawer,
      close: closeDrawer
    }] = useDisclosure(false)

  return (
    <Box pb={20}>
      <Header px='md' height={headerHeight}>
        <Container size='xl' sx={{ height: '100%' }}>
          <Group position='apart' sx={{ height: '100%' }}>
            <Link href="/">
              <Image
                alt='Magicdex Logo'
                src='/favicon.ico'
                width={headerHeight * 0.75}
              />
            </Link>

            <Group
              sx={{ height: '100%' }}
              spacing={0}
              className={classes.hiddenMobile}
            >
              {navbarRoutes.map((route, idx) => (
                <NavbarLink key={idx} href={route.url}>
                  {route.title}
                </NavbarLink>
              ))}
            </Group>

            <Menu withArrow
              opened={menuOpened}
              onChange={setMenuOpened}
            >
              <Menu.Target>
                {
                  isUserAuthenticated && session.data?.user?.image
                    ? <Box pos='relative' p={rem(4)}>
                      <Image
                        radius='xl'
                        className={cx(
                          classes.hiddenMobile,
                          { [classes.avatarHover]: avatarIconHovering || menuOpened }
                        )}
                        style={{ cursor: 'pointer' }}
                        alt='User Avatar'
                        src={session.data.user?.image}
                        width={headerHeight * 0.6}
                        height={headerHeight * 0.6}
                        onMouseEnter={() => setAvatarIconHovering(true)}
                        onMouseLeave={() => setAvatarIconHovering(false)}
                      />
                    </Box>
                    : <Avatar
                      color='white'
                      variant={avatarIconHovering || menuOpened ? 'filled' : 'default'}
                      onMouseEnter={() => setAvatarIconHovering(true)}
                      onMouseLeave={() => setAvatarIconHovering(false)}
                      style={{ cursor: 'pointer', color: 'white' }}
                      className={classes.hiddenMobile}
                    />
                }
              </Menu.Target>

              <Menu.Dropdown>
                {
                  isUserAuthenticated &&
                  <Menu.Item closeMenuOnClick onClick={() => router.push('/profile')}>
                    Profile
                  </Menu.Item>
                }

                <LoginLogoutButtons
                  component={({ children, ...props }) => (
                    <Menu.Item closeMenuOnClick {...props}>
                      {children}
                    </Menu.Item>
                  )}
                />

                <Menu.Divider />

                <Menu.Item
                  closeMenuOnClick={false}
                  icon={
                    colorScheme == 'dark'
                      ? <IconMoonFilled size={rem(14)} />
                      : <IconSunFilled size={rem(14)} />
                  }
                  onClick={() => toggleColorScheme()}
                >
                  Toggle Theme
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Box
              pos='relative'
              className={classes.hiddenDesktop}
              onClick={toggleDrawer}
            >
              {
                isUserAuthenticated && session.data?.user?.image
                  ? <Image
                    radius='xl'
                    className={cx({
                      [classes.avatarHover]: drawerOpened
                    })}
                    alt='User Avatar'
                    src={session.data.user?.image}
                    width={headerHeight * 0.6}
                    height={headerHeight * 0.6}
                  />
                  : <Burger opened={drawerOpened} />
              }
            </Box>

          </Group>
        </Container>
      </Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size='100%'
        padding='md'
        title='Navigation'
        className={classes.hiddenDesktop}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          <Divider my='sm' />

          {navbarRoutes.map((route, idx) => (
            <NavbarLink sidebar
              key={idx}
              onClick={closeDrawer}
              href={route.url}
            >
              {route.title}
            </NavbarLink>
          ))}

          <Divider my='sm' />

          <Group grow position='center' pb='xl' px='md'>
            <LoginLogoutButtons
              reversed
              afterOnClick={closeDrawer}
              logoutProps={{ color: 'red' }}
            />
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  )
}
