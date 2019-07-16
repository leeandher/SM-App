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
 * @param {function} asyncFunction Asynchronous function which will have the errorHandler attached to it: (snapshot, context)
 * @summary Wrap asynchronous database functions with error event handler
 */
exports.catchDBErrors = asyncFunction => {
  return function(snapshot, context) {
    return asyncFunction(snapshot, context).catch(error => console.error)
  }
}
