var express = require('express');
var router = express.Router();
var connection = require('./dataconnect');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// Các biến môi trường
const GOOGLE_MAILER_CLIENT_ID = process.env.GOOGLE_MAILER_CLIENT_ID;
const GOOGLE_MAILER_CLIENT_SECRET = process.env.GOOGLE_MAILER_CLIENT_SECRET;
const GOOGLE_MAILER_REFRESH_TOKEN = process.env.GOOGLE_MAILER_REFRESH_TOKEN;
const ADMIN_EMAIL_ADDRESS = process.env.ADMIN_EMAIL_ADDRESS;

// Khởi tạo OAuth2Client với Client ID và Client Secret
const myOAuth2Client = new OAuth2Client(
  GOOGLE_MAILER_CLIENT_ID,
  GOOGLE_MAILER_CLIENT_SECRET
);

// Set Refresh Token vào OAuth2Client Credentials
myOAuth2Client.setCredentials({
  refresh_token: GOOGLE_MAILER_REFRESH_TOKEN
});

router.post('/send', async (req, res) => {
  try {
    const { Email, subject, content } = req.body;
    if (!Email || !subject || !content) throw new Error('Please provide email, subject and content!');

    const myAccessTokenObject = await myOAuth2Client.getAccessToken();
    const myAccessToken = myAccessTokenObject?.token;

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: ADMIN_EMAIL_ADDRESS,
        clientId: GOOGLE_MAILER_CLIENT_ID,
        clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
        refreshToken: GOOGLE_MAILER_REFRESH_TOKEN,
        accessToken: myAccessToken,
      },
    });

    const mailOptions = {
      to: Email,
      subject: subject,
      html:`<h3>${content}</h3>`,
    };

    await transport.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: error.message });
  }
});
// call back trạng thái 
router.put('/update-status/:id/', (req, res) => {
  const contactId = req.params.id;

  const { status } = req.body;

  // Gọi stored procedure
  const query = 'CALL UpdateContactStatus(?, ?)';
  const params = [contactId, status];

  
  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      return res.status(500).json({ errors: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nội dung phản hồi' });
    }

    res.status(200).json({ message: 'Cập nhật trạng thái thành công' });
  });
});




module.exports = router;
