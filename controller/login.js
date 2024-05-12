var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('./middleware');



// ADMIN
router.post('/admin-login', function(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).jsonp({ error: 'Email và mật khẩu là bắt buộc.' });
  }

  var sql = "SELECT id, username, email, role FROM accounts WHERE email = ? AND password = ?";
  connection.query(sql, [email, password], function (err, results) {
    if (err) {
      console.error('Lỗi dữ liệu:', err);
      return res.status(500).jsonp({ error: 'Lỗi máy chủ mysql .' });
    }

    if (results.length === 0) {
      return res.status(401).jsonp({ error: 'Email hoặc mật khẩu không hợp lệ' });
    }
    const user = {
      id: results[0].id,
      username: results[0].username,
      email: results[0].email,
      role: results[0].role
    };

    require('dotenv').config();
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('Thiếu giá trị cho JWT_SECRET');
      return res.status(500).jsonp({ error: 'Lỗi máy chủ.' });
    }

    try {
      const token = jwt.sign({ user }, jwtSecret, { expiresIn: '1h' });
      
      res.jsonp({ token });
    } catch (error) {
      console.error('Lỗi khi tạo token:', error);
      return res.status(500).jsonp({ error: 'Lỗi tạo token.' });
    }
  });
});
// Thông tin admin
router.get('/admin-info', verifyToken, (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).jsonp({ error: 'Truy cập bị từ chối. Không có mã thông báo được cung cấp.' });
  }

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Lỗi khi giải mã token:', err);
      return res.status(500).jsonp({ error: 'Lỗi khi giải mã token.' });
    }

    // Trả về thông tin người dùng từ token
    res.jsonp({ user: decoded.user });
  });
});

// lấy toàn bộ người dùng
router.get('/getall', verifyToken, function(req, res, next) {
  var sql = "SELECT * FROM accounts";
  connection.query(sql, function (err, results) {
    if(err) throw err;
    res.jsonp(results);
  });
});

router.get('/getonce/:id', verifyToken, function(req, res, next) {
  const Id = req.params.id;
  const sql = "SELECT * FROM accounts WHERE id = ?";
  
  connection.query(sql, [Id], function (err, results) {
    if (err) {
      console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
      return res.status(500).json({ error: "Lỗi máy chủ" });
    }
    res.jsonp(results);
  });
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const query = 'INSERT INTO accounts (username, email, password, role) VALUES (?, ?, ?, ?)';
    const results = await new Promise((resolve, reject) => {
      connection.query(query, [username, email, password, role], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    res.status(201).json({
      id: results.insertId,
      status: true
    });
  } catch (error) {
    console.error('Lỗi đăng ký tài khoản:', error);
    res.status(500).json({
      error: 'Lỗi máy chủ',
      status: false
    });
  }
});
// Client
router.post('/client-login', function(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).jsonp({ error: 'Email và mật khẩu là bắt buộc.' });
  }

  var sql = "SELECT  id, name, address, phone, email FROM customers WHERE email = ? AND password = ?";
  connection.query(sql, [email, password], function (err, results) {
    if (err) {
      console.error('Lỗi dữ liệu:', err);
      return res.status(500).jsonp({ error: 'Lỗi máy chủ mysql .' });
    }

    if (results.length === 0) {
      return res.status(401).jsonp({ error: 'Email hoặc mật khẩu không hợp lệ' });
    }
    const client = {
      customer_id: results[0].id,
      name: results[0].name,
      address: results[0].address,
      phone: results[0].phone,
      email: results[0].email, 
    };

    require('dotenv').config();
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('Thiếu giá trị cho JWT_SECRET');
      return res.status(500).jsonp({ error: 'Lỗi máy chủ.' });
    }

    try {
      const token = jwt.sign({ client }, jwtSecret, { expiresIn: '1h' });
      res.jsonp({ token });
    } catch (error) {
      console.error('Lỗi khi tạo token:', error);
      return res.status(500).jsonp({ error: 'Lỗi tạo token.' });
    }
  });
});
// register
router.post('/client-register', async (req, res) => {
  try {
    const { name, address, phone, email, password } = req.body;

    const query = 'INSERT INTO customers  ( name, address, phone, email, password) VALUES (?, ?, ?, ?, ?)';
    const results = await new Promise((resolve, reject) => {
      connection.query(query, [name, address, phone, email, password], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    res.status(201).json({
      id: results.insertId,
      status: true
    });
  } catch (error) {
    console.error('Lỗi đăng ký tài khoản:', error);
    res.status(500).json({
      error: 'Lỗi máy chủ',
      status: false
    });
  }
});

// Lay token cho người dùng
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, client) => {
    if (err) return res.sendStatus(403);
    req.client = client;
    next();
  });
}
// thông tin người dùng
router.get('/client-info', authenticateToken, (req, res) => {
  const clientInfo = req.client.client;
  res.json(clientInfo);
});

module.exports = router;
