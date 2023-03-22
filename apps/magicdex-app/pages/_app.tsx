import { CustomFooter, CustomHeader } from '@/components'
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { getCookie, setCookie } from 'cookies-next'
import NextApp, { AppContext, AppProps } from 'next/app'
import Head from 'next/head'
import { useState } from 'react'
import './styles.css'


const App = ({
  Component,
  pageProps,
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
  }

  return (
    <>
      <Head>
        <title>Welcome to magicdex-app!</title>
      </Head>

      <main>
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
              colorScheme,
              primaryColor: 'violet',
              // primaryShade: 8,
              white: '#F8F9FA',
            }}
          >
            <ModalsProvider>
              <Notifications
                limit={3}
                position='bottom-left'
              />

              <CustomHeader />
              <Component {...pageProps} />
              <CustomFooter />

            </ModalsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
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
