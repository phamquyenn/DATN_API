const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Thiết lập storage cho multer
const storage = multer.diskStorage({
  destination: './uploads/products/',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
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

// Lấy ảnh một ảnh upload
router.get('/getproductimage/:filename', (req, res) => {
  const fileName = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads/products', fileName);
  res.sendFile(imagePath);
});

router.get('/getallimagesinfo', function(req, res) {
  const imageDirectory = path.join(__dirname, '../uploads/products');

  try {
    const files = fs.readdirSync(imageDirectory);
    const imageList = files.map(file => {
      const imageUrl = `localhost:3000/image/getproductimage/${file}`;
      const imagePath = path.join(imageDirectory, file);
      const stats = fs.statSync(imagePath);
      const imageSize = stats.size; // Kích thước ảnh

      return { filename: file, url: imageUrl, size: imageSize };
    });

    res.json(imageList);
  } catch (err) {
    console.error("Lỗi khi đọc thư mục ảnh:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});
// Endpoint để xóa ảnh
router.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads/products', filename);

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error("Lỗi khi xóa ảnh:", err);
      return res.status(500).json({ error: "Lỗi máy chủ" });
    }

    res.json({ message: "Ảnh đã được xóa thành công!" });
  });
});

module.exports = router;
