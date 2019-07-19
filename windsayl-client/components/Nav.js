import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'

const StylishToolbar = styled(Toolbar)`
  margin: 0 auto;
  height: 40px;
`

const Nav = () => (
  <AppBar>
    <StylishToolbar>
      <Link href="/">
        <Button color="inherit">Home</Button>
      </Link>
      <Link href="/welcome">
        <Button color="inherit">Login / Signup</Button>
      </Link>
    </StylishToolbar>
  </AppBar>
)

export default Nav
