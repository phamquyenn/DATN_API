var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');

// Getall
router.get('/getall', function(req, res, next) {
    var sql = "SELECT * FROM contact ";
    connection.query(sql, function (err, results){
        if(err) throw err;
        res.jsonp(results);
    });
});
// getonce
router.get('/getonce/:id', function(req, res, next) {
    const Id = req.params.id;
    const sql = "SELECT * FROM contact WHERE ID = ?";
    
    connection.query(sql, [Id], function (err, results) {
        if (err) {
            console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
            return res.status(500).json({ error: "Lỗi máy chủ" });
        }
        res.jsonp(results);
    });
});
// create
router.post('/Add', async (req, res) => {
    const { Name,  Email, PhoneNumber, Address ,Content } = req.body;
  
    const sql = `CALL CreateContact(?, ?, ?, ?, ?)`;
  
    try {
      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [ Name,  Email, PhoneNumber, Address, Content], (err, results) => {
          if (err) {
            console.error("Lỗi khi thêm :", err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
      res.json({ message: "Contact đã được thêm thành công!" });
    } catch (error) {
      console.error("Lỗi từ máy chủ:", error);
      res.status(500).json({ error: "Lỗi máy chủ" });
    }
  });

// update
router.put('/update/:id', (req, res) => {
    const ID = req.params.id;
    const {  Name,  Email, PhoneNumber, Address, Content} = req.body;
  
    const sql = `CALL UpdateContact(?, ?, ?, ?, ?, ?)`;
  
    connection.query(
        sql, [
          ID,  Name,  Email, PhoneNumber, Address, Content
        ],
        (err, results) => {
            if (err) {
                console.error("Lỗi khi cập nhật :", err);
                return res.status(500).json({ error: "Lỗi máy chủ" });
            }
            res.json({ message: "Contact đã được cập nhật thành công!" });
        }
    );
  });
// delete
router.delete('/delete/:id', (req, res) => {
    const ID = req.params.id;
  
    const sql = `CALL DeleteContact(?)`;
    connection.query( sql, [ID],(err, results) => 
        {
            if (err) {
                console.error("Lỗi khi xóa khách hàng:", err);
                return res.status(500).json({ error: "Lỗi máy chủ" });
            }
            res.json({ message: "khách hàng đã được xóa thành công!" });
        }
    );
  });


module.exports = router;