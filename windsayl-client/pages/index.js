import Grid from "@material-ui/core/Grid"

import Feed from "../components/Feed"
import ProfileCard from "../components/ProfileCard"

const Home = () => {
  return (
    <Grid container spacing={4}>
      <Feed item sm={8} xs={12} />
      <ProfileCard item sm={4} xs={12} />
    </Grid>
  )
}

export default Home
