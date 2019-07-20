import React from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardMedia from "@material-ui/core/CardMedia"

const WaveContent = styled(CardContent)`
  p {
    margin: 0;
  }
`

const Wave = ({ wave }) => {
  const {
    body,
    handle,
    displayPicture,
    commentCount,
    splashCount,
    rippleCount,
    createdAt,
  } = wave
  return (
    <Card>
      <CardMedia
        image={displayPicture}
        title={`~${handle}`}
        alt={`~${handle}`}
      />
      <WaveContent>
        <h4 className="handle">~{handle}</h4>
        <p className="created-at">{createdAt}</p>
        <p className="body">{body}</p>
      </WaveContent>
    </Card>
  )
}

Wave.propTypes = {
  wave: PropTypes.shape({
    body: PropTypes.string.isRequired,
    handle: PropTypes.string.isRequired,
    displayPicture: PropTypes.string.isRequired,
    commentCount: PropTypes.number.isRequired,
    splashCount: PropTypes.number.isRequired,
    rippleCount: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
  }),
}

export default Wave
