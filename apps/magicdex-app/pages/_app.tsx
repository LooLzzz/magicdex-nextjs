import { AppProps } from 'next/app'
import Head from 'next/head'
import './styles.css'


function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to magicdex-app!</title>
      </Head>

      <main>
        <Component {...pageProps} />
      </main>
    </>
  )
}

export default App
