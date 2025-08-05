const { HttpError } = require('./httpError');

/**
 * Simple authentication middleware: expects 'x-user-id' header.
 * Attaches req.userId and flows through.
 */
function authenticate(req, _res, next) {
  const userId = req.header('x-user-id');
  if (!userId) {
    return next(new HttpError(401, 'Unauthorized'));
  }
  req.userId = userId;
  next();
}

module.exports = { authenticate };
