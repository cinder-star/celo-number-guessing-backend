function basicCreateMiddleware(req, res, next) {
  const fields = ['hints', 'secretNumber', 'maxAttempts', 'funds'];
  for (let field of fields) {
    if (!req.body.hasOwnProperty(field)) {
      return next(new Error(`Missing field: ${field}`));
    }
  }
  return next();
}

function playMiddleware(req, res, next) {
  const fields = ['gameId', 'secretNumber', 'player'];
  for (let field of fields) {
    if (!req.body.hasOwnProperty(field)) {
      return next(new Error(`Missing field: ${field}`));
    }
  }
  return next();
}

module.exports = {
  basicCreateMiddleware,
  playMiddleware,
};
