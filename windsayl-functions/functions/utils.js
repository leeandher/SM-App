/**
 * @param {function} asyncFunction Asynchronous function which will have the errorHandler attache to it: (req, res, next)
 * @param {function} errorHandler Error handling function which accepts the following parameters: (error, req, res, next)
 * @summary Wrap asynchronous functions with event handler
 */
exports.catchErrors = (asyncFunction, errorHandler) => {
  return function(req, res, next) {
    return asyncFunction(req, res, next).catch(error =>
      errorHandler(error, req, res, next)
    );
  };
};

/**
 * @param {string} string The string to be checked for a value
 * @summary Returns a boolean depending on whether or not the passed string is empty
 */
exports.isEmpty = string => string.trim() === "";

/**
 * @param {string} string The string to be checked if it is a valid email
 * @summary Returns a boolean depending on whether or not the passed string is a valid email
 */
exports.isEmail = string => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return string.match(emailRegEx);
};
