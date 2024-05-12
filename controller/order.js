var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');
const verifyToken = require('./middleware');

router.get('/getall', function(req, res, next) {
    var sql = "CALL GetAllOrders()";  
    connection.query(sql, function (err, results){
        if(err) {
            console.error('Lỗi truy vấn dữ liệu:', err);
            return res.status(500).jsonp({ error: 'Lỗi máy chủ.' });
        }
        res.jsonp(results[0]);
    });
});
router.get('/customer/:id', function(req, res, next) {
    const customerId  = req.params.id;
    const sql = "call GetCustomerOrders(?)";
    
    connection.query(sql, [customerId], function (err, results) {
        if (err) {
            console.error("Lỗi thực hiện truy vấn dữ liệu:", err);
            return res.status(500).json({ error: "Lỗi máy chủ" });
        }
        res.jsonp(results[0]);
    });
});
router.delete('/delete/:productId', (req, res) => {
  const productId = req.params.productId;

  // Gọi procedure trong cơ sở dữ liệu
  connection.query('CALL DeleteOrderByProductId(?)', [productId], (err, results) => {
    if (err) {
      console.error('Lỗi khi gọi procedure:', err);
      res.status(500).json({ error: 'Lỗi máy chủ' });
      return;
    }

    console.log('Đã xóa đơn hàng thành công!');
    res.json({ message: 'Đã xóa đơn hàng thành công!' });
  });
});

// cập nhận trạng thái đơn hàng 
router.patch('/update-status/:orderId', verifyToken, function(req, res, next) {
  const orderId = req.params.orderId;

  // Thực hiện truy vấn cập nhật trạng thái của đơn hàng
  connection.query('UPDATE orders SET order_status = ? WHERE id = ?', ['Đã xác nhận', orderId], function(err, results) {
    if (err) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
    console.log('Đã cập nhật trạng thái đơn hàng thành công!');
    res.json({ message: 'Đã cập nhật trạng thái đơn hàng thành công!' });
  });
});
// Hủy đơn hàng
router.patch('/cancel-order/:orderId', verifyToken, function(req, res, next) {
  const orderId = req.params.orderId;

  connection.query('UPDATE orders SET order_status = ? WHERE id = ?', ['Hủy đơn hàng', orderId], function(err, results) {
    if (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
    console.log('Đã hủy đơn hàng thành công!');
    res.json({ message: 'Đã hủy đơn hàng thành công!' });
  });
});
// TỔng tiền hóa đơn bán
router.get('/total_amount',function(req, res, next) {
  const sql = "SELECT SUM(total_amount) AS total FROM orders";  
  connection.query(sql, function (err, results) {
      if(err) {
          console.error('Lỗi truy vấn dữ liệu:', err);
          return res.status(500).json({ error: 'Lỗi máy chủ.' });
      }
     
      res.json(results[0]);
  });n
});
// Tổng đơn hàng
router.get('/count', function(req, res, next) {
  const sql = "SELECT COUNT(*) AS order_count FROM orders";  
  connection.query(sql, function (err, results) {
      if(err) {
          console.error('Lỗi truy vấn dữ liệu:', err);
          return res.status(500).json({ error: 'Lỗi máy chủ.' });
      }
      const orderCount = results[0].order_count;
      res.json({ orderCount });
  });
});

// Thống kê 
// router.get('/thongke/:weekday', (req, res) => {
//   const weekday = parseInt(req.params.weekday);
//   connection.query('CALL sales_statistics_by_weekday(?)', [weekday], (error, results, fields) => {
//     if (error) {
//       console.error('Lỗi khi gọi thủ tục: ' + error.message);
//       res.status(500).send('Lỗi bên serve');
//       return;
//     }
    
//     if (results && results[0].length > 0) {
//       res.json(results[0]); 
//     } else {
//       res.status(404).send('No data found');
//     }
//   });
// });
// Thống kê theo ngày tháng năm
router.get('/Thongke/:timeframe/:value', (req, res) => {
  const { timeframe, value } = req.params;

  // Gọi thủ tục MySQL
  connection.query('CALL sales_statistics(?, ?)',[timeframe, value],(err, results) => {
      if (err) {
        console.error('Lỗi khi gọi thủ tục:', err);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi gọi thủ tục MySQL' });
        return;
      }
      // Trả về kết quả từ thủ tục MySQL
      res.json(results[0]);
    }
  );
});

module.exports = router;
