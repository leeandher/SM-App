/**
 * @param {string} string The string to be checked for a value
 * @summary Returns a boolean depending on whether or not the passed string is empty
 */
exports.isEmpty = string => string.trim() === ''

/**
 * @param {string} string The string to be checked if it is a valid email
 * @summary Returns a boolean depending on whether or not the passed string is a valid email
 */
exports.isEmail = string => {
  const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return string.match(emailRegEx)
}

/**
 * @param {string} mimetype The mimetype-string of the file in question
 * @summary Returns a boolean depending on whether or not the passed mimetype corresponds to an image
 */
exports.isImage = mimetype => {
  return mimetype.startsWith('image/')
}
