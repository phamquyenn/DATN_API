var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');

// GET ALL USERS
router.get('/getall', function(req, res, next) {
    var sql = "SELECT * FROM accounts";
    connection.query(sql, function (err, results){
        if(err) throw err;
        res.jsonp(results);
    });
  });
// GET ONCE USER
router.get('/getonce/:id', function(req, res, next) {
  const accountsid = req.params.id;
  const sql = "SELECT * FROM accounts WHERE id = ?";
  
  connection.query(sql, [accountsid], function (err, results) {
      if (err) {
          console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
          return res.status(500).json({ error: "Lỗi máy chủ" });
      }
      res.jsonp(results);
  });
});

//  ADD USER
router.post('/addaccount', (req, res) => {
  const {
      username, password, role
    } = req.body;

  const sql = `CALL AddAccount(?, ?, ?)`;

  connection.query(
      sql, [
        username, password, role
      ],
      (err, results) => {
          if (err) {
              console.error("Lỗi khi thêm :", err);
              return res.status(500).json({ error: "Lỗi máy chủ" });
          }
          res.json({ message: "Account của bạn đã được thêm thành công!" });
      }
  );
});
// UPDATE USERS

router.put('/updateaccount/:id', (req, res) => {
  const accountId = req.params.id;
  const {
    username, password, role
  } = req.body;

  const sql = `CALL UpdateAccount(?, ?, ?, ?)`;

  connection.query(
      sql, [
        accountId, username, password, role
      ],
      (err, results) => {
          if (err) {
              console.error("Lỗi khi cập nhật Account:", err);
              return res.status(500).json({ error: "Lỗi máy chủ" });
          }
          res.json({ message: "Account đã được cập nhật thành công!" });
      }
  );
});
// DELETE USER
router.delete('/deleteaccount/:id', (req, res) => {
  const accountId = req.params.id;

  const sql = `CALL DeleteAccount(?)`;
  connection.query(
      sql, [accountId],
      (err, results) => {
          if (err) {
              console.error("Lỗi khi xóa account:", err);
              return res.status(500).json({ error: "Lỗi máy chủ" });
          }

          res.json({ message: "Account đã được xóa thành công!" });
      }
  );
});
  

module.exports = router;