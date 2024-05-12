var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');



router.get('/getall', function(req, res, next) {
    var sql = "SELECT * FROM categories ";
    connection.query(sql, function (err, results){
        if(err) throw err;
        res.jsonp(results);
    });
});

router.get('/getonce/:id', function(req, res, next) {
    const Id = req.params.id;
    const sql = "SELECT * FROM categories WHERE category_id = ?";
    
    connection.query(sql, [Id], function (err, results) {
        if (err) {
            console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
            return res.status(500).json({ error: "Lỗi máy chủ" });
        }
        res.jsonp(results);
    });
});
// Lay san pham theo loai
router.get('/GetProductsByCategory/:id', (req, res) => {
    const category_id = req.params.id;

    connection.query(
        'CALL GetProductsByCategory(?)',
        [category_id],
        (err, results) => {
            if (err) {
                console.error('Error executing stored procedure: ', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json(results[0]);
        }
    );
});
// ADMIN
// ADD
router.post('/AddCategory', async (req, res) => {
    const { category_name } = req.body;
  
    if (!category_name) {
      return res.status(400).json({ error: "Tên loại sản phẩm là bắt buộc" });
    }
  
    const sql = `CALL AddCategory(?)`;
  
    try {
      const results = await new Promise((resolve, reject) => {
        connection.query(sql, [category_name], (err, results) => {
          if (err) {
            console.error("Lỗi khi thêm loại sản phẩm:", err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
  
      res.json({ message: "Loại sản phẩm đã được thêm thành công!" });
    } catch (error) {
      console.error("Lỗi từ máy chủ:", error);
      res.status(500).json({ error: "Lỗi máy chủ" });
    }
  });

// UPDATE
router.put('/updateCategory/:id', (req, res) => {
    const id = req.params.id;
    const {
        category_name
    } = req.body;
    
    if (!category_name) {
      return res.status(400).json({ error: "Tên loại sản phẩm là bắt buộc" });
    }
    
    const sql = `CALL UpdateCategories(?, ?)`;
  
    connection.query(
        sql, [
            id, category_name
        ],
        (err, results) => {
            if (err) {
                console.error("Lỗi khi cập nhật loại sản phẩm:", err);
                return res.status(500).json({ error: "Lỗi máy chủ" });
            }
            res.json({ message: "loại sản phẩm đã được cập nhật thành công!" });
        }
    );
  });
// DELETE
router.delete('/deleteCategory/:id', (req, res) => {
    const Id = req.params.id;
  
    const sql = `CALL DeleteCategories(?)`;
    connection.query(
        sql, [Id],
        (err, results) => {
            if (err) {
                console.error("Lỗi khi xóa loại sản phẩm:", err);
                return res.status(500).json({ error: "Lỗi máy chủ" });
            }
  
            res.json({ message: "loại sản phẩm đã được xóa thành công!" });
        }
    );
  });

module.exports = router;
