import React from 'react'
import styled, { ThemeProvider } from 'styled-components'

import Nav from './Nav'

import palette from '../styles/_palette'

const PageWrapper = styled.div`
  background: white;
  color: #000;
`
const ContentWrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
`

const Page = () => {
  return (
    <ThemeProvider theme={palette}>
      <PageWrapper>
        <Nav />
        <ContentWrapper />
      </PageWrapper>
    </ThemeProvider>
  )
}

export default Page
