import { useState, useEffect } from "react"
import axios from "axios"
import Grid from "@material-ui/core/Grid"
import { FUNCTIONS_ENDPOINT } from "../constants"

const Home = () => {
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
    <Grid container spacing={4}>
      <Grid item sm={8} xs={12}>
        <p>Content....</p>
      </Grid>
      <Grid item sm={4} xs={12}>
        <p>Profile...</p>
      </Grid>
    </Grid>
  )
}

export default Home
