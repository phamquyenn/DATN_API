var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var logger = require('morgan');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

require("dotenv").config();




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var emailRouter = require('./routes/email');

var users = require('./controller/users');
var products = require('./controller/products');
var employees = require('./controller/employees');
var news = require('./controller/news');
var brand = require('./controller/brand');
var categories = require('./controller/categories');
var logins = require('./controller/login');
var uploadImage = require('./controller/UploadImage');
var jwt = require('./controller/middleware');
var order = require('./controller/order');
var customers = require('./controller/customer');
var payment = require('./controller/vnpayment');
var favorites = require('./controller/favorites');
var about = require('./controller/aboutus');
var inventory = require('./controller/inventory');
var email = require('./controller/email');
var contact = require('./controller/contact');
var paymentcod = require('./controller/paymentcod');




const corsOptions = {
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  Headers: 'X-Requested-With,content-type',
  credentials: true, 
};





var app = express();
// Sử dụng middleware cors
// app.use(cors());
app.use(cors(corsOptions));

// Sử dụng body-parser để xử lý dữ liệu từ yêu cầu POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/Acount', users);
app.use('/product', products);
app.use('/employees', employees);
app.use('/news', news);
app.use('/brand', brand);
app.use('/categories', categories);
app.use('/login', logins);
app.use('/middleware', jwt);
app.use('/order', order);
app.use('/customer', customers);
app.use('/vnpayment', payment);
app.use('/image', uploadImage);
app.use('/favorites', favorites);
app.use('/about', about);
app.use('/inventory', inventory);
app.use('/contact', contact);
app.use('/email', email);
app.use('/paymentcod', paymentcod);



// app.use('/send', mail);
app.use('/sendemail', emailRouter);





app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token');
  }
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
