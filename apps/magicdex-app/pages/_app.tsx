import { CustomFooter, CustomHeader } from '@/components'
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
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getCookie, setCookie } from 'cookies-next'
import { SessionProvider } from 'next-auth/react'
import NextApp, { AppContext, AppProps } from 'next/app'
import Head from 'next/head'
import { useState } from 'react'
import './styles.css'


const getMantineTheme = (colorScheme: ColorScheme): MantineThemeOverride => ({
  colorScheme,
  // primaryColor: 'violet',
  primaryColor: 'indigo',
  // primaryShade: 8,
  white: '#F8F9FA',

  components: {
    Divider: {
      defaultProps: theme => ({
        color: (
          theme.colorScheme === 'dark'
            ? '#69737d'
            // ? theme.colors.gray[7]
            : '#acafb3'
            // : theme.colors.gray[4]
        )
      }),
    },
    SegmentedControl: {
      defaultProps: theme => ({
        bg: (
          theme.colorScheme === 'dark'
            ? theme.colors.dark[4]
            : theme.colors.gray[3]
        ),
      }),
    },
    Carousel: {
      defaultProps: {
        styles: {
          control: {
            '&[data-inactive]': {
              opacity: 0,
              cursor: 'default',
            },
          },
        },
      },
    },
    Paper: {
      defaultProps: theme => ({
        bg: (
          theme.colorScheme === 'dark'
            ? theme.colors.gray[8]
            : theme.colors.gray[2]
        ),
      }),
    },
    Tooltip: {
      defaultProps: {
        withArrow: true,
        transitionProps: {
          transition: 'pop',
        },
      },
    },
  },

  globalStyles: (theme) => ({
    // body: {
    //   background: (
    //     theme.colorScheme === 'dark'
    //       ? `linear-gradient(160deg, transparent 0%, rgba(255,255,255,1) 600%)`
    //       : `linear-gradient(160deg, transparent 0%, rgba(0,0,0,0.3)       250%)`
    //   ),
    // },

    '.ss-common': {
      color: (
        theme.colorScheme === 'dark'
          ? '#60584D'
          : theme.colors.dark[5]
      ),
    },

    '.ss-2x': {
      fontSize: '1.65rem',
    },

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
      backgroundColor: theme.fn.themeColor(theme.primaryColor, 7),
    },

    '.mantine-footer': {
      marginTop: rem(20),
      borderTop: `${rem(1)} solid`,
      backgroundColor: (
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[2]
      ),
      borderColor: (
        theme.colorScheme === 'dark'
          ? theme.colors.dark[5]
          : theme.colors.gray[3]
      ),
    },

    '.mantine-Carousel-viewport': {
      transition: 'height 0.2s',
    },

    '.mantine-Carousel-container': {
      transition: 'height 0.2s',
      display: 'flex',
      alignItems: 'flex-start',
    },

    '.mantine-Checkbox-input': {
      cursor: 'pointer',
    },

  }),
})

const App = ({
  Component,
  pageProps: { session, dehydratedState, ...pageProps },
  colorScheme: _colorScheme
}:
  AppProps & { colorScheme: ColorScheme }
) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(_colorScheme)
  const [queryClient] = useState(() => new QueryClient())


  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark')
    setColorScheme(nextColorScheme)
    // when color scheme is updated save it to cookie
    setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 })

    showNotification({
      // TODO: maybe remove this?
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
          <QueryClientProvider client={queryClient}>
            <Hydrate state={dehydratedState}>
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
                    <Container fluid
                      sx={{
                        minHeight: `calc(100vh - 100px)`,
                      }}
                    >
                      <Component {...pageProps} />
                    </Container>
                    <CustomFooter />

                  </ModalsProvider>
                </MantineProvider>
              </ColorSchemeProvider>
            </Hydrate>
          </QueryClientProvider>
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
