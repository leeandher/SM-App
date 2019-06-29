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
