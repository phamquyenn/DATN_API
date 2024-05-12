var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');

router.get('/getall/:cus_id', function(req, res, next) {
    let cus_id = req.params.cus_id
    var sql = "SELECT f.*, p.* FROM favorites f JOIN products p ON f.product_id = p.product_id WHERE f.customer_id = ?";
    connection.query(sql,[cus_id], function (err, results){
        if(err) throw err;
        res.jsonp(results);
    });
});
router.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
  
    const sql = "DELETE from favorites where id=? ";
    connection.query(
        sql, [id],
        (err, results) => {
            if (err) {
                console.error("Lỗi khi xóa tin tức:", err);
                return res.status(500).json({ error: "Lỗi máy chủ" });
            }
            res.json({ message: " đã được xóa thành công!" });
        }
    );
  });

router.post('/add', (req, res) => {
    let formData = req.body;
    let sql = "SELECT * FROM favorites WHERE customer_id = ? AND product_id = ?";
    connection.query(sql, [formData.customer_id, formData.product_id], function(err, data) {
        if (err) {
            console.error("Lỗi khi thực hiện truy vấn :", err);
            res.status(500).send({
                error: "lỗi serve"
            });
            return;
        }

        if (data.length > 0) {
            let sql1 = "DELETE FROM favorites WHERE customer_id = ? AND product_id = ?";
            connection.query(sql1, [formData.customer_id, formData.product_id], function(err, data) {
                if (err) {
                    console.error("Lỗi khi thực hiện truy vấn :", err);
                    res.status(500).send({
                        error: "lỗi serve"
                    });
                    return;
                }
                res.send({
                    result: "Đã bỏ yêu thích thành công"
                });
            });
        } else {
            let sql2 = "INSERT INTO favorites SET ?";
            connection.query(sql2, formData, function(err, data) {
                if (err) {
                    console.error("Lỗi khi thực hiện truy vấn :", err);
                    res.status(500).send({
                        error: "lỗi serve"
                    });
                    return;
                }
                res.send({
                    result: "Thêm Yêu thích thành công"
                });
            });
        }
    });
});

module.exports = router;
