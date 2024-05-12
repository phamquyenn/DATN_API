var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');

router.get('/getall', function(req, res, next) {
    var sql = "SELECT * FROM customers ";
    connection.query(sql, function (err, results){
        if(err) throw err;
        res.jsonp(results);
    });
});
// GETONCE
router.get('/getonce/:id', function(req, res, next) {
  const Id = req.params.id;
  const sql = "SELECT * FROM customers WHERE id = ?";
  
  connection.query(sql, [Id], function (err, results) {
      if (err) {
          console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
          return res.status(500).json({ error: "Lỗi máy chủ" });
      }
      res.jsonp(results);
  });
});
// ADD 
router.post('/AddCustomer', async (req, res) => {
    const { name, address, phone, email, password } = req.body;
  
    if (!name) {
      return res.status(400).json({ error: "Tên khách hàng là bắt buộc" });
    }
  
    const sql = `CALL AddCustomers(?, ?, ?, ?, ?)`;
  
    try {
      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [name, address, phone, email, password], (err, results) => {
          if (err) {
            console.error("Lỗi khi thêm khách hàng:", err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
  
      res.json({ message: "Khách hàng đã được thêm thành công!" });
    } catch (error) {
      console.error("Lỗi từ máy chủ:", error);
      res.status(500).json({ error: "Lỗi máy chủ" });
    }
  });
// UPDATE
router.put('/updatCustomer/:id', (req, res) => {
    const id = req.params.id;
    const {
      name,address, phone, email, password
      
    } = req.body;
  
    const sql = `CALL UpdateCustomer(?, ?, ?, ?, ?, ?)`;
  
    connection.query(
        sql, [
          id, name, address, phone, email, password
        ],
        (err, results) => {
            if (err) {
                console.error("Lỗi khi cập nhật khách hàng:", err);
                return res.status(500).json({ error: "Lỗi máy chủ" });
            }
            res.json({ message: "khách hàng đã được cập nhật thành công!" });
        }
    );
  });
// DELETE
router.delete('/deletCustomer/:id', (req, res) => {
    const id = req.params.id;
  
    const sql = `CALL DeleteCustomer(?)`;
    connection.query(
        sql, [id],
        (err, results) => {
            if (err) {
                console.error("Lỗi khi xóa khách hàng:", err);
                return res.status(500).json({ error: "Lỗi máy chủ" });
            }
  
            res.json({ message: "khách hàng đã được xóa thành công!" });
        }
    );
  });


// Tổng số khách hàng 
router.get('/total_customers', (req, res) => {
    var sql = "SELECT COUNT(*) AS total_customers FROM customers ";
    connection.query(sql, function (err, results){
        if(err) throw err;
        res.jsonp(results);
    });
});
module.exports = router;