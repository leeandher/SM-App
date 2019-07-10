/**
 * @param {function} asyncFunction Asynchronous function which will have the errorHandler attached to it: (req, res, next)
 * @param {function} errorHandler Error handling function which accepts the following parameters: (error, req, res, next)
 * @summary Wrap asynchronous functions with error event handler
 */
exports.catchErrors = (asyncFunction, errorHandler) => {
  return function(req, res, next) {
    return asyncFunction(req, res, next).catch(error =>
      errorHandler(error, req, res, next)
    )
  }
}

/**
 * @param {function} asyncFunction Asynchronous function which will have the errorHandler attached to it: (snapshot)
 * @param {function} errorHandler Error handling function which accepts the following parameters: (error, snapshot)
 * @summary Wrap asynchronous database functions with error event handler
 */
exports.catchDBErrors = (asyncFunction, errorHandler) => {
  return function(snapshot) {
    return asyncFunction(snapshot).catch(error => errorHandler(error, snapshot))
  }
}
