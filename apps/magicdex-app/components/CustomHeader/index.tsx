import routes from '@/pages/(routes)'
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
import { useEffect } from 'react'
import NavbarLink from './NavbarLink'
import useStyles from './styles'


export default function CustomHeader({
  headerHeight = 60
}: {
  headerHeight?: number
}) {
  const router = useRouter()
  const { classes } = useStyles()

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false)
  // const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false)

  // Close drawer on route change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(closeDrawer, [router.pathname])

  return (
    <Box pb={20}>
      <Header height={headerHeight} px='md'>
        <Container sx={{ height: '100%' }}>
          <Group position='apart' sx={{ height: '100%' }}>
            <Link href="/">
              <Image alt='Magicdex Logo' src='favicon.ico' width={headerHeight * 0.75} />
            </Link>

            <Group
              sx={{ height: '100%' }}
              spacing={0}
              className={classes.hiddenMobile}
            >
              {routes.map(route => (
                <NavbarLink key={route.href} href={route.href}>
                  {route.title}
                </NavbarLink>
              ))}
            </Group>

            <Group className={classes.hiddenMobile}>
              <Link href='login'>
                <Button variant='default'>Log in</Button>
              </Link>
              <Link href='signup'>
                <Button>Sign up</Button>
              </Link>
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

          {routes.map(route => (
            <NavbarLink sidebar key={route.href} href={route.href}>
              {route.title}
            </NavbarLink>
          ))}

          <Divider my='sm' />

          <Group position='center' grow pb='xl' px='md'>
            <Button variant='default'>Log in</Button>
            <Button>Sign up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  )
}
