var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');

router.get('/tinh-tong-so-luong', (req, res) => {
    connection.query('CALL TinhTongSoLuong(@TongKho)', (error) => {
        if (error) {
          console.error('Lỗi procedure:', error);
          res.status(500).send('Lỗi server');
          return;
        }
    
        connection.query('SELECT @TongKho AS TongKho', (error, results) => {
          if (error) {
            console.error('không có results:', error);
            res.status(500).send('Lỗi server2');
            return;
          }
          res.jsonp( results[0].TongKho);
        });
      });
  });


  // 
  router.get('/GetProductInventory', function(req, res, next) {
    var sql = "call GetProductInventory()";
    connection.query(sql, function (err, results){
      if(err) throw err;
      res.jsonp(results);
    });
  });
  // Hóa đơn nhập
  router.post('/update-inventory', (req, res) => {
    const purchaseOrderId = req.body.purchase_order_id;

    if (!purchaseOrderId) {
        return res.status(400).send('purchase_order_id is required');
    }

    const sql = 'CALL UpdateInventoryOnPurchase(?)';
    connection.query(sql, [purchaseOrderId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error executing stored procedure');
        }
        res.send('Inventory updated successfully');
    });
});
//  đơn hàng nhập
router.get('/getall', function(req, res, next) {
  var sql = "SELECT * FROM purchase_orders ";
  connection.query(sql, function (err, results){
      if(err) throw err;
      res.jsonp(results);
  });
});

router.get('/purchase-order-details/:purchaseOrderId', (req, res) => {
  const purchaseOrderId = req.params.purchaseOrderId;

  const query = `CALL GetPurchaseOrderDetails(${purchaseOrderId})`;

  connection.query(query, (error, results) => {
      if (error) {
          console.error('Lỗi truy vấn:', error);
          res.status(500).json({ error: 'Đã xảy ra lỗi khi truy vấn cơ sở dữ liệu.' });
          return;
      }
      res.json(results[0]); 
  });
});


module.exports = router;