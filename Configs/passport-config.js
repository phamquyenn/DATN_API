const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
var connection = require('/controller/dataconnect');


const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "quyen", // Thay thế bằng secret key thực tế
};

passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      const userId = jwt_payload.id;
  
      // Thực hiện truy vấn để kiểm tra người dùng trong cơ sở dữ liệu
      const query = "SELECT * FROM accounts WHERE id = ?";
  
      connection.query(query, [userId], (error, results) => {
        if (error) {
          return done(error, false);
        }
  
        if (results.length > 0) {
          const user = results[0];
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
module.exports = router;