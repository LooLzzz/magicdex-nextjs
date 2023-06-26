/* eslint-disable @next/next/no-css-tags */

import { createGetInitialProps } from '@mantine/next'
import Document, { Head, Html, Main, NextScript } from 'next/document'


const getInitialProps = createGetInitialProps()

export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head>
          <link
            href='//cdn.jsdelivr.net/npm/keyrune@latest/css/keyrune.css'
            rel='stylesheet'
            type='text/css'
          />
          <link
            href='//cdn.jsdelivr.net/npm/mana-font@latest/css/mana.css'
            rel='stylesheet'
            type='text/css'
          />
          <link
            href='//undertalefonts.duodecima.technology/webfonts/stylesheet.css'
            rel='stylesheet'
            type='text/css'
          />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
