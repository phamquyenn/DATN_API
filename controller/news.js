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
  var sql = "SELECT * FROM news ";
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

// Details News

// getall 
router.get('/getall-details', function(req, res, next) {
  var sql = "SELECT * FROM news_details ";
  connection.query(sql, function (err, results){
      if(err) throw err;
      res.jsonp(results);
  });
}); 
// getonce
router.get('/getonce-details/:id', function(req, res, next) {
  const Id = req.params.id;
  const sql = "SELECT * FROM news_details WHERE id = ?";
  
  connection.query(sql, [Id], function (err, results) {
      if (err) {
          console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
          return res.status(500).json({ error: "Lỗi máy chủ" });
      }
      res.jsonp(results);
  });
});
// add
router.post('/add-details', (req, res) => {
  const {  author, title, content } = req.body;

  if ( !author || !title || !content) {
    return res.status(400).json({ error: 'Vui lòng cung cấp  tác giả, tiêu đề và nội dung' });
  }

  const query = 'CALL CreateNewsDetail(?, ?, ?)';
  connection.query(query, [ author, title, content], (err, results) => {
    if (err) {
      console.error('Lỗi procedure:', err);
      return res.status(500).json({ error: 'Tạo thất bại' });
    }
    res.status(200).json({ message: 'Đã tạo thành công' });
  });
});
// update
router.put('/update-details/:id', (req, res) => {
  const { id } = req.params;
  const { author, title, content } = req.body;

  const query = 'CALL UpdateNewsDetail(?, ?, ?, ?)';
  connection.query(query, [id, author, title, content], (err, results) => {
    if (err) {
      console.error('Procedure bị lỗi:', err);
      return res.status(500).json({ error: 'Cập nhật lỗi' });
    }
    res.status(200).json({ message: 'Cập nhật thành công' });
  });
});
// delete
router.delete('/delete-detail/:id', (req, res) => {
  const id = req.params.id;

  const sql = `CALL DeleteNewsDetail(?)`;
  connection.query(
      sql, [id],
      (err, results) => {
          if (err) {
              console.error("Lỗi khi xóa :", err);
              return res.status(500).json({ error: "Lỗi máy chủ" });
          }
          res.json({ message: "  Xóa thành công!" });
      }
  );
});
// lấy details new theo id 
router.get('/get-details-new-by-news/:id', (req, res) => {
  const { id } = req.params;

  const query = 'CALL GetNewsDetailByNewsId(?)';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Lỗi procedure:', err);
      return res.status(500).json({ error: 'Không thể lấy dữ liệu' });
    }
    res.status(200).json(  results[0] );
  });
});

// Thêm thông tin news và details
router.post('/add-news-with-details', upload.single('image_url'), (req, res) => {
  const { news_title, news_content, author, detail_title, detail_content } = req.body;
  const image_url = req.file ? req.file.filename  : null; 

  const query = 'CALL AddNewsWithDetails(?, ?, ?, ?, ?, ?)';
  const params = [news_title, news_content, image_url, author, detail_title, detail_content];

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error('Lỗi procedure:', err);
      return res.status(500).json({ error: 'Lỗi khi thêm ' });
    }
    res.status(200).json({ message: 'Thêm thành công' });
  });
});
//  cập nhật thông tin news và details
router.put('/update-news-and-details/:id', upload.single('image_url'), (req, res) => {
  const { id } = req.params;
  const { news_title, news_content, author, detail_title, detail_content } = req.body;
  const image_url = req.file ? req.file.filename  : null; 

  const query = 'CALL UpdateNewsAndDetails(?, ?, ?, ?, ?, ?, ?)';
  const params = [id, news_title, news_content, image_url, author, detail_title, detail_content];

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error('Lỗi procedure:', err);
      return res.status(500).json({ error: 'Lỗi khi sửa ' });
    }
    res.status(200).json({ message: 'Sửa thành công' });
  });
});
// Xóa
router.delete('/delete-news-and-details/:id', (req, res) => {
  const { id } = req.params;

  const query = 'CALL DeleteNewsAndDetails(?)';
  const params = [id];

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error('Lỗi procedure:', err);
      return res.status(500).json({ error: 'Lỗi khi Xóa ' });
    }
    res.status(200).json({ message: 'Xóa thành công' });
  });
});
// Tin tức mới nhất
router.get('/GetLatestNews', (req, res) => {
  const query = 'CALL GetLatestThreeNews()';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi procedure:', err);
      return res.status(500).json({ error: 'Không thể lấy dữ liệu' });
    }
    res.status(200).json(  results[0] );
  });
});

module.exports = router;
