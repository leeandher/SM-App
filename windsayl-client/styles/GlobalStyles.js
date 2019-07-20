import { createGlobalStyle } from "styled-components"

const GlobalStyles = createGlobalStyle`
  html {
    box-sizing: border-box;
    font-size: 10px;
  }
  *, *:before, *:after {
    box-sizing: inherit;
    font-family: 'Josefin Sans','Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  body {
    padding: 0;
    margin: 0;
    font-size: 1.5rem;
  }
  a {
    text-decoration: none;
    color: #0783cb;
  }
  button:hover {
    cursor: pointer;
  }
`

export default GlobalStyles
