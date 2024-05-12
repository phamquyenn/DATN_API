const mysql = require('mysql2');
// Tạo kết nối cơ sở dữ liệu
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '14022002',
    database: 'APP_PERFUME'
  });
  
  // Kết nối cơ sở dữ liệu
  connection.connect((err) => {
    if (err) {
      console.error('Lỗi kết nối cơ sở dữ liệu: ' + err.stack);
      return;
    }
    console.log('Đã kết nối với cơ sở dữ liệu ID ' + connection.threadId);
  });

  module.exports = connection;