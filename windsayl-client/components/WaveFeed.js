import { useState, useEffect } from "react"
import axios from "axios"
import Grid from "@material-ui/core/Grid"
import { FUNCTIONS_ENDPOINT } from "../constants"

const WaveFeed = props => {
  useEffect(() => {
    async function getWaves() {
      const { data } = await axios.get(`${FUNCTIONS_ENDPOINT}/wave`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      })
      console.log(data)
    }
    getWaves().catch(err => alert("EWWHAT"))
  })
  return (
    <Grid {...props}>
      <p>Content....</p>
    </Grid>
  )
}

export default WaveFeed
