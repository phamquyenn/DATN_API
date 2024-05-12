// middleware.js
const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Xác thực thất bại' });
    }

    req.user = decoded.user; 
    next();
  });
};

module.exports = verifyToken;
