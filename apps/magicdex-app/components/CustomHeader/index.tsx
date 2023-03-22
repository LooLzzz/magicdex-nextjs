import navbarRoutes from '@/pages/(navbarRoutes)'
import {
  Box,
  Burger,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Header,
  Image,
  rem,
  ScrollArea
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NavbarLink from './NavbarLink'
import useStyles from './styles'


export default function CustomHeader({
  headerHeight = 60
}: {
  headerHeight?: number
}) {
  const router = useRouter()
  const { classes } = useStyles()

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

            <Group className={classes.hiddenMobile}>
              {/* TODO: hide behind an 'profile' icon popover */}
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
