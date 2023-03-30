import { CustomFooter, CustomHeader } from '@/components'
import defaultFetcher from '@/services/fetchers'
import {
  ColorScheme,
  ColorSchemeProvider,
  Container,
  MantineProvider,
  MantineThemeOverride,
  rem
} from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications, showNotification } from '@mantine/notifications'
import { getCookie, setCookie } from 'cookies-next'
import { SessionProvider } from 'next-auth/react'
import NextApp, { AppContext, AppProps } from 'next/app'
import Head from 'next/head'
import { useState } from 'react'
import { SWRConfig } from 'swr'
import './styles.css'


const getMantineTheme = (colorScheme: ColorScheme): MantineThemeOverride => ({
  colorScheme,
  primaryColor: 'violet',
  // primaryShade: 8,
  white: '#F8F9FA',

  globalStyles: (theme) => ({
    // body: {
    //   background: (
    //     theme.colorScheme === 'dark'
    //       ? `linear-gradient(160deg, transparent 0%, rgba(255,255,255,1) 600%)`
    //       : `linear-gradient(160deg, transparent 0%, rgba(0,0,0,0.3)       250%)`
    //   ),
    // },

    '.mantine-Overlay-root': {
      backgroundColor: (
        theme.colorScheme === 'dark'
          ? 'rgba(44, 46, 51, 0.75)'
          : 'rgba(210, 210, 220, 0.75)'
      ),
    },

    '.mantine-Header-root': {
      borderColor: (
        theme.colorScheme === 'dark'
          ? theme.colors.dark[5]
          : theme.colors.gray[4]
      ),
    },
    '.mantine-footer': {
      marginTop: rem(20),
      borderTop: `${rem(1)} solid`,
      borderColor: (
        theme.colorScheme === 'dark'
          ? theme.colors.dark[5]
          : theme.colors.gray[4]
      ),
    },
  }),
})

const App = ({
  Component,
  pageProps: { session, ...pageProps },
  colorScheme: _colorScheme
}:
  AppProps & { colorScheme: ColorScheme }
) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(_colorScheme)

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark')
    setColorScheme(nextColorScheme)
    // when color scheme is updated save it to cookie
    setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 })

    showNotification({
      // TODO: remove this
      title: 'Color scheme toggled',
      message: `Current color scheme is now ${colorScheme === 'dark' ? 'light' : 'dark'}`,
      color: colorScheme === 'dark' ? 'red' : 'blue',
    })
  }

  return (
    <>
      <Head>
        <title>Welcome to magicdex-app!</title>
      </Head>

      <main>
        <SessionProvider session={session}>
          <SWRConfig
            value={{
              fetcher: defaultFetcher,
              // revalidateOnFocus: true,
              // refreshInterval: 3000,
            }}
          >
            <ColorSchemeProvider
              colorScheme={colorScheme}
              toggleColorScheme={toggleColorScheme}
            >
              <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={getMantineTheme(colorScheme)}
              >
                <ModalsProvider>
                  <Notifications
                    limit={3}
                    position='bottom-left'
                  />
                  <CustomHeader />
                  <Container>
                    <Component {...pageProps} />
                  </Container>
                  <CustomFooter />

                </ModalsProvider>
              </MantineProvider>
            </ColorSchemeProvider>
          </SWRConfig>
        </SessionProvider>
      </main>
    </>
  )
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext)
  return {
    ...appProps,
    colorScheme: getCookie('mantine-color-scheme', appContext.ctx) || 'dark',
  }
}

export default App
