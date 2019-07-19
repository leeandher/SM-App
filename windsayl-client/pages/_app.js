import App, { Container } from "next/app"
import Head from "next/head"

import Page from "../components/Page"
import GlobalStyles from "../styles/GlobalStyles"

class WindsaylApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    return { pageProps }
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <Container>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <link rel="stylesheet" type="text/css" href="/static/nprogress.css" />
          <link
            href="https://fonts.googleapis.com/css?family=Josefin+Sans&display=swap"
            rel="stylesheet"
          />
          <title>🌊 Windsayl</title>
        </Head>
        <GlobalStyles />
        <Page>
          <Component {...pageProps} />
        </Page>
      </Container>
    )
  }
}

export default WindsaylApp
