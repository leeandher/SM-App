import Grid from "@material-ui/core/Grid"

import WaveFeed from "../components/WaveFeed"
import ProfileCard from "../components/ProfileCard"

const Home = () => {
  return (
    <Grid container spacing={4}>
      <WaveFeed item sm={8} xs={12} />
      <ProfileCard item sm={4} xs={12} />
    </Grid>
  )
}

export default Home
