var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');
const fs = require('fs'); 
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


// Thiết lập storage cho multer 

const storage = multer.diskStorage({
  destination: './uploads/products/',
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'image_url-' + uniqueSuffix + path.extname(file.originalname));
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
// GETALL
router.get('/getall', function(req, res, next) {
  var sql = "SELECT * FROM news LIMIT 3";
  connection.query(sql, function (err, results){
      if(err) throw err;
      res.jsonp(results);
  });
}); 
router.get('/getallamin', function(req, res, next) {
    var sql = "SELECT * FROM news ";
    connection.query(sql, function (err, results){
        if(err) throw err;
        res.jsonp(results);
    });
  }); 

// GET ONCE 
router.get('/getonce/:id', function(req, res, next) {
  const Id = req.params.id;
  const sql = "SELECT * FROM news WHERE id = ?";
  
  connection.query(sql, [Id], function (err, results) {
      if (err) {
          console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
          return res.status(500).json({ error: "Lỗi máy chủ" });
      }
      res.jsonp(results);
  });
});
// Lấy ảnh khi được uploads
router.get('/getproductimage/:filename', (req, res) => {
    const fileName = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/products', fileName);
    res.sendFile(imagePath);
});
// ADD
router.post('/addnews', upload.single('image_url'), (req, res) => {
  const {
      title, content, 
  } = req.body;

  if (!title) {
      return res.status(400).json({ error: "Tên tin tức là bắt buộc" });
  }

  // Lấy dữ liệu ảnh từ req.file
  const image_url = req.file ? req.file.filename : null;

  if (!image_url) {
    return res.status(400).json({ error: "Ảnh tin tức là bắt buộc" });
  }

  const sql = `CALL AddNews(?, ?, ?)`;

  connection.query(
      sql, [
        title, content ,image_url
      ],
      (err, results) => {
          if (err) {
              console.error("Lỗi khi thêm tin tức:", err);
              return res.status(500).json({ error: "Lỗi máy chủ" });
          }
          res.json({ message: " Tin Tức đã được thêm thành công!" });
      }
  );
});
// UPLOAD
router.put('/updatenews/:id', upload.single('image_url'), (req, res) => {
  const id = req.params.id;
  const {
      title, content
  } = req.body;

  const image_url = req.file ? req.file.filename  : null; 

  const sql = `CALL UpdateNews(?, ?, ?, ?)`;

  connection.query(
      sql, [
        id, title, content ,image_url
      ],
      (err, results) => {
          if (err) {
              console.error("Lỗi khi cập nhật tin tức:", err);
              return res.status(500).json({ error: "Lỗi máy chủ" });
          }
          res.json({ message: "tin tức đã được cập nhật thành công!" });
      }
  );
});
// DELETE

router.delete('/deletenews/:id', (req, res) => {
  const id = req.params.id;

  const sql = `CALL DeleteNews(?)`;
  connection.query(
      sql, [id],
      (err, results) => {
          if (err) {
              console.error("Lỗi khi xóa tin tức:", err);
              return res.status(500).json({ error: "Lỗi máy chủ" });
          }
          res.json({ message: "Tin tức đã được xóa thành công!" });
      }
  );
});

// router.delete('/deletenews/:id', (req, res) => {
//   const productId = req.params.id;

//   // Lấy tên file ảnh cũ trước khi xóa tin tức
//   const sqlSelectOldImage = "SELECT image_url FROM news WHERE id = ?";
//   connection.query(sqlSelectOldImage, [productId], (err, results) => {
//       if (err) {
//           console.error("Lỗi khi lấy tên file ảnh cũ:", err);
//           return res.status(500).json({ error: "Lỗi máy chủ" });
//       }
//       // Thực hiện xóa tin tức
//       const sqlDeleteNews = `CALL DeleteNews(?)`;
//       connection.query(sqlDeleteNews, [productId], (errDelete, resultsDelete) => {
//           if (errDelete) {
//               console.error("Lỗi khi xóa tin tức:", errDelete);
//               return res.status(500).json({ error: "Lỗi máy chủ" });
//           }
//           // Nếu có ảnh cũ, xóa ảnh từ thư mục
//           const oldImage = results && results[0] ? results[0].image_url : null;
//           if (oldImage) {
//               const imagePath = path.join(__dirname, '../uploads/products', oldImage);
//               fs.unlink(imagePath, (errUnlink) => {
//                   if (errUnlink) {
//                       console.error("Lỗi khi xóa ảnh cũ:", errUnlink);
//                       return res.status(500).json({ error: "Lỗi máy chủ" });
//                   }

//                   res.json({ message: "Tin tức và ảnh đã được xóa thành công!" });
//               });
//           } else {
//               res.json({ message: "Tin tức đã được xóa thành công!" });
//           }
//       });
//   });
// });



module.exports = router;
