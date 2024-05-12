var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './uploads/about/',
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'About-' + uniqueSuffix + path.extname(file.originalname));
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
// GET ONCE 
router.get('/getonce/:id', function(req, res, next) {
    const Id = req.params.id;
    const sql = "SELECT * FROM about_us WHERE id = ?";
    
    connection.query(sql, [Id], function (err, results) {
        if (err) {
            console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
            return res.status(500).json({ error: "Lỗi máy chủ" });
        }
        res.jsonp(results);
    });
  });

  router.get('/getall', function(req, res, next) {
    var sql = "SELECT * FROM about_us  ";
    connection.query(sql, function (err, results){
        if(err) throw err;
        res.jsonp(results);
     });
    });

    // Thêm 
    router.post('/addabout', upload.single('image'), (req, res) => {
        const {
            name, description
        } = req.body;
      
        const image = req.file ? req.file.filename : null;
      
        if (!image) {
          return res.status(400).json({ error: "Ảnh giới thiệu bắt buộc" });
        }
      
        const sql = `CALL AddAboutUs(?, ?, ?)`;
      
        connection.query(
            sql, [
                name, description, image
            ],
            (err, results) => {
                if (err) {
                    console.error("Lỗi khi thêm phần giới thiệu:", err);
                    return res.status(500).json({ error: "Lỗi máy chủ" });
                }
                res.json({ message: " thông tin giới thiệu đã được thêm thành công!" });
            }
        );
      });
    // Update 
    router.put('/updateabout/:id', upload.single('image'), (req, res) => {
        const id = req.params.id;
        const {
            name, description
        } = req.body;
      
        const image = req.file ? req.file.filename  : null; 
        
        const sql = `CALL UpdateAboutUs(?, ?, ?, ?)`;
      
        connection.query(
            sql, [
                id, name, description, image
            ],
            (err, results) => {
                if (err) {
                    console.error("Lỗi khi cập nhật giới thiệu web:", err);
                    return res.status(500).json({ error: "Lỗi máy chủ" });
                }
                res.json({ message: "Thông tin giới thiệu đã được cập nhật thành công!" });
            }
        );
      });
    //   DELETE

      router.delete('/delete/:id', (req, res) => {
        const Id = req.params.id;
      
        const sql = `CALL DeleteAboutUs(?)`;
        connection.query(
            sql, [Id],
            (err, results) => {
                if (err) {
                    console.error("Lỗi khi xóa :", err);
                    return res.status(500).json({ error: "Lỗi máy chủ" });
                }
      
                res.json({ message: " đã được xóa thành công!" });
            }
        );
      });
// lấy ảnh
      router.get('/getimage/:filename', (req, res) => {
        const fileName = req.params.filename;
        const imagePath = path.join(__dirname, '../uploads/about', fileName);
        res.sendFile(imagePath);
      });

module.exports = router;