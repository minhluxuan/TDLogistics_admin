// Import nodemailer module
const nodemailer = require('nodemailer');

// Function to send email
async function sendMail(mailOptions) {
    try {
        // Create a transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_AUTH_USER, // Địa chỉ email của bạn
                pass: process.env.MAIL_AUTH_PASSWORD // Mật khẩu email của bạn
            }
        });

        // Thông tin về email cần gửi
        // let mailOptions = {
        //     from: 'your_email@gmail.com', // Địa chỉ email gửi
        //     to: 'recipient_email@example.com', // Địa chỉ email nhận
        //     subject: 'Test email from Node.js', // Chủ đề email
        //     text: 'This is a test email sent from Node.js using nodemailer.' // Nội dung email
        // };

        // Gửi email
        let info = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log('Error occurred: ' + error.message);
    }
}

module.exports = {
    sendMail,
}
