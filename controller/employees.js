var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');
const verifyToken = require('./middleware');


router.get('/getall',verifyToken, function(req, res, next) {
    var sql = "SELECT * FROM employees";
    connection.query(sql, function (err, results){
        if(err) throw err;
        res.jsonp(results);
    });
  });

// GETONCE
router.get('/getonce/:id', function(req, res, next) {
  const id = req.params.id;
  const sql = "SELECT * FROM employees WHERE id = ?";
  
  connection.query(sql, [id], function (err, results) {
      if (err) {
          console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
          return res.status(500).json({ error: "Lỗi máy chủ" });
      }
      res.jsonp(results);
  });
});
// ADD 
router.post('/addemployee', (req, res) => {
  const {
    name, position, salary, address, phone, email
    } = req.body;

  const sql = `CALL AddEmployee(?, ?, ?, ?, ?, ?)`;

  connection.query(
      sql, [
        name, position, salary, address, phone, email
      ],
      (err, results) => {
          if (err) {
              console.error("Lỗi khi thêm :", err);
              return res.status(500).json({ error: "Lỗi máy chủ" });
          }
          res.json({ message: "employee của bạn đã được thêm thành công!" });
      }
  );
});
// UPDATE
router.put('/updateemployee/:id', (req, res) => {
  const id = req.params.id;
  const {
    name, position, salary, address, phone, email
    
  } = req.body;

  const sql = `CALL UpdateEmployee(?, ?, ?, ?, ?, ?, ?)`;

  connection.query(
      sql, [
        id, name, position, salary, address, phone, email
      ],
      (err, results) => {
          if (err) {
              console.error("Lỗi khi cập nhật Account:", err);
              return res.status(500).json({ error: "Lỗi máy chủ" });
          }
          res.json({ message: "Employee đã được cập nhật thành công!" });
      }
  );
});
// DELETE
router.delete('/deleteemployee/:id', (req, res) => {
  const id = req.params.id;

  const sql = `CALL DeleteEmployee(?)`;
  connection.query(
      sql, [id],
      (err, results) => {
          if (err) {
              console.error("Lỗi khi xóa account:", err);
              return res.status(500).json({ error: "Lỗi máy chủ" });
          }

          res.json({ message: "Employee đã được xóa thành công!" });
      }
  );
});
// SEARCH ROLE AND NAME OR NUMBER





  

module.exports = router;