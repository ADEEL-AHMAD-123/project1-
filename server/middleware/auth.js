const jwt = require('jsonwebtoken');
const User = require('../model/user');

const authMiddleware = (roles) => async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user || !roles.includes(user.role)) {
      return res.status(403).send('Forbidden');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};

module.exports = authMiddleware;
