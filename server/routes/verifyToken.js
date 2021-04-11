const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {

  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Access denied');

  // If token exists, verify it

  try {
    const verified = jwt.verify(token, process.env.KEY)
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
}