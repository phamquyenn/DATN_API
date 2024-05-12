var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');
const multer = require('multer');
const path = require('path');

// Thiết lập storage cho multer 

const storage = multer.diskStorage({
    destination: './uploads/brand/',
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'brand_image-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Chỉ cho phép tải lên các file ảnh'));
        }
        cb(null, true);
    }
  });

router.get('/getall', function(req, res, next) {
    var sql = "SELECT * FROM brand  ";
    connection.query(sql, function (err, results){
        if(err) throw err;
        res.jsonp(results);
    });
});
// GET ONCE 
router.get('/getonce/:id', function(req, res, next) {
    const Id = req.params.id;
    const sql = "SELECT * FROM brand WHERE Brand_id = ?";
    
    connection.query(sql, [Id], function (err, results) {
        if (err) {
            console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
            return res.status(500).json({ error: "Lỗi máy chủ" });
        }
        res.jsonp(results);
    });
  });
// ADD
router.post('/addbrand', upload.single('brand_image'), (req, res) => {
    const {
        name, address, phone, email
    } = req.body;
  
    if (!name) {
        return res.status(400).json({ error: "Tên thương hiệu là bắt buộc" });
    }
  
    // Lấy dữ liệu ảnh từ req.file
    const brand_image = req.file ? req.file.filename : null;
  
    if (!brand_image) {
      return res.status(400).json({ error: "Ảnh thương hiệu là bắt buộc" });
    }
  
    const sql = `CALL AddBrand(?, ?, ?, ?, ?)`;
  
    connection.query(
        sql, [
            name, address, phone, email, brand_image
        ],
        (err, results) => {
            if (err) {
                console.error("Lỗi khi thêm thương hiệu:", err);
                return res.status(500).json({ error: "Lỗi máy chủ" });
            }
            res.json({ message: " thương hiệu đã được thêm thành công!" });
        }
    );
  });

// Lấy ảnh khi được uploads
router.get('/getimage/:filename', (req, res) => {
    const fileName = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/brand', fileName);
    res.sendFile(imagePath);
  });
// UPDATE
router.put('/updatebrand/:id', upload.single('brand_image'), (req, res) => {
    const Brand_id = req.params.id;
    const {
        name, address, phone, email
    } = req.body;
  
    const brand_image = req.file ? req.file.filename  : null; 
    
    const sql = `CALL UpdateBrand(?, ?, ?, ?, ?, ?)`;
  
    connection.query(
        sql, [
            Brand_id,  name, address, phone, email, brand_image
        ],
        (err, results) => {
            if (err) {
                console.error("Lỗi khi cập nhật thương hiệu:", err);
                return res.status(500).json({ error: "Lỗi máy chủ" });
            }
            res.json({ message: "Thương hiệu đã được cập nhật thành công!" });
        }
    );
  });

// DELETE

router.delete('/deleteBrand/:id', (req, res) => {
    const Id = req.params.id;
  
    const sql = `CALL DeleteBrand(?)`;
    connection.query(
        sql, [Id],
        (err, results) => {
            if (err) {
                console.error("Lỗi khi xóa thương hiệu:", err);
                return res.status(500).json({ error: "Lỗi máy chủ" });
            }
  
            res.json({ message: "Thương hiệu đã được xóa thành công!" });
        }
    );
  });

module.exports = router;
