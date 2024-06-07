const express = require('express');
const router = express.Router();
const moment = require('moment');
const connection = require('./dataconnect');

router.post('/create_cod_payment', function (req, res, next) {
    const {
        customer_id,
        products_id,
        shipAddress,
        quantity,
        price,
        payment_method
    } = req.body;

    const date = new Date();
    const Createdate = moment(date).format('YYYYMMDDHHmmss');
    let totalAmount = 0;
    // Tính tổng tiền của đơn hàng
    for (let i = 0; i < products_id.length; i++) {
        const productAmount = quantity[i] * price[i];
        totalAmount += productAmount;
    }

    const insertOrderQuery = 'INSERT INTO orders (order_date, order_status, customer_id, total_amount) VALUES (NOW(), ?, ?, ?)';
    const insertDetailQuery = 'INSERT INTO order_details (quantity, product_id, order_id, price, shipAddress, bankcode) VALUES (?, ?, ?, ?, ?, ?)';

    connection.beginTransaction(function (err) {
        if (err) { 
            return res.status(500).json({ message: 'Database transaction start failed', error: err });
        }
        connection.query(insertOrderQuery, ['Chờ xác nhận', customer_id, totalAmount], function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    res.status(500).json({ message: 'Order insertion failed', error });
                });
            }
            const orderId = results.insertId;
            for (let i = 0; i < products_id.length; i++) {
                connection.query(insertDetailQuery, [quantity[i], products_id[i], orderId, price[i], shipAddress, payment_method],
                    function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function () {
                                res.status(500).json({ message: 'Order detail insertion failed', error });
                            });
                        }
                        const updateProductQuery = 'UPDATE products SET quantity = quantity - ? WHERE product_id = ?';
                        const updateProductValues = [quantity[i], products_id[i]];
                        connection.query(updateProductQuery, updateProductValues, function (error, results, fields) {
                            if (error) {
                                return connection.rollback(function () {
                                    res.status(500).json({ message: 'Product quantity update failed', error });
                                });
                            }
                        });
                    });
            }
            connection.commit(function (err) {
                if (err) {
                    return connection.rollback(function () {
                        res.status(500).json({ message: 'Transaction commit failed', error: err });
                    });
                }
                console.log('Transaction Complete.');
                return res.json({ message: 'COD payment processed successfully' });
            });
        });
    });
});

module.exports = router;
