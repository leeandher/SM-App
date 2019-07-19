import React from 'react'
import styled, { ThemeProvider } from 'styled-components'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'

import Nav from './Nav'

import palette from '../styles/_palette'
import { themer } from '../styles/helpers'

const PageWrapper = styled.div`
  background: white;
  color: #000;
`
const ContentWrapper = styled.div`
  max-width: 960px;
  margin: ${themer('constants.navHeight')} auto 0;
  padding: 2rem;
`

// const MuiTheme = createMuiTheme

const Page = ({ children }) => {
  return (
    <ThemeProvider theme={palette}>
      <PageWrapper>
        <Nav />
        <ContentWrapper>{children}</ContentWrapper>
      </PageWrapper>
    </ThemeProvider>
  )
}

export default Page
