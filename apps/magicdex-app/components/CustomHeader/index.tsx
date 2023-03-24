import navbarRoutes from '@/pages/(navbarRoutes)'
import {
  Avatar,
  Box,
  Burger,
  Button,
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
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import NavbarLink from './NavbarLink'
import useStyles from './styles'


export default function CustomHeader({
  headerHeight = 60
}: {
  headerHeight?: number
}) {
  const router = useRouter()
  const { classes } = useStyles()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

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
      <Header height={headerHeight} px='md'>
        <Container sx={{ height: '100%' }}>
          <Group position='apart' sx={{ height: '100%' }}>
            <Link href="/">
              <Image
                alt='Magicdex Logo'
                src='favicon.ico'
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
                <Avatar
                  variant={avatarIconHovering || menuOpened ? 'filled' : 'default'}
                  onMouseEnter={() => setAvatarIconHovering(true)}
                  onMouseLeave={() => setAvatarIconHovering(false)}
                  style={{ cursor: 'pointer' }}
                  className={classes.hiddenMobile}
                />
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item closeMenuOnClick onClick={() => router.push('/login')}>Login</Menu.Item>
                <Menu.Item closeMenuOnClick onClick={() => router.push('/signup')}>Signup</Menu.Item>

                <Menu.Divider />
                <Menu.Item
                  closeMenuOnClick={false}
                  icon={
                    colorScheme == 'dark'
                      ? <IconMoonFilled size={14} />
                      : <IconSunFilled size={14} />
                  }
                  onClick={() => toggleColorScheme()}
                >
                  Toggle Theme
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>


            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              className={classes.hiddenDesktop}
            />
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
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          <Divider my='sm' />

          {navbarRoutes.map((route, idx) => (
            <NavbarLink sidebar onClick={closeDrawer} key={idx} href={route.url}>
              {route.title}
            </NavbarLink>
          ))}

          <Divider my='sm' />

          <Group position='center' grow pb='xl' px='md'>
            <Button
              variant='default'
              onClick={() => router.push('/login') && closeDrawer()}
            >
              Log in
            </Button>
            <Button onClick={() => router.push('/signup') && closeDrawer()}>
              Sign up
            </Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  )
}
