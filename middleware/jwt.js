const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Truy cập bị từ chối. Không có mã thông báo được cung cấp.' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: 'Thiếu giá trị cho JWT_SECRET.' });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token không hợp lệ.' });
    }
    next();
  });
};

module.exports = { verifyToken };
