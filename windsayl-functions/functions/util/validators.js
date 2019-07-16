/**
 * @param {string} string The string to be checked for a value
 * @summary Returns a boolean depending on whether or not the passed string is empty
 */
exports.isEmpty = string => {
  if (typeof string !== 'string') {
    throw new Error(
      `Argument passed to 'isEmpty()' was: ${typeof string}, expected string`
    )
  }
  return string.trim() === ''
}

/**
 * @param {string} string The string to be checked if it is a valid email
 * @summary Returns a boolean depending on whether or not the passed string is a valid email
 */
exports.isEmail = string => {
  if (typeof string !== 'string') {
    throw new Error(
      `Argument passed to 'isEmail()' was: ${typeof string}, expected string`
    )
  }
  const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return string.match(emailRegEx)
}

/**
 * @param {string} mimetype The mimetype-string of the file in question
 * @summary Returns a boolean depending on whether or not the passed mimetype corresponds to an image
 */
exports.isImage = mimetype => {
  if (typeof mimetype !== 'string') {
    throw new Error(
      `Argument passed to 'isEmail()' was: ${typeof string}, expected string`
    )
  }
  return mimetype.startsWith('image/')
}

exports.cleanUserData = ({ bio, website, location }) => {
  const userData = {}

  if (bio && !this.isEmpty(bio.trim())) userData.bio = bio
  if (website && !this.isEmpty(website.trim())) {
    userData.website =
      website.trim().substring(0, 4) === 'http' ? website : `http://${website}`
  }
  if (location && !this.isEmpty(location.trim())) userData.location = location
  return userData
}
