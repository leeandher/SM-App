import { useState, useEffect } from "react"
import axios from "axios"
import Grid from "@material-ui/core/Grid"
import { FUNCTIONS_ENDPOINT } from "../constants"

import Wave from "./Wave"

const Feed = props => {
  const [waves, setWaves] = useState([])
  useEffect(() => {
    async function getWaves() {
      const { data } = await axios.get(`${FUNCTIONS_ENDPOINT}/wave`)
      setWaves(data)
    }
    getWaves().catch(err => console.error(err))
  })
  return (
    <Grid {...props}>
      {waves.map(wave => (
        <Wave wave={wave} key={wave.waveId} />
      ))}
    </Grid>
  )
}

export default Feed
