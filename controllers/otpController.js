const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const otpService = require("../services/otpService");
const { error } = require("winston");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASSWORD,
    }
});

const createOTP = async (req, res) => {
    const { phone_number, email } = req.body;

    const otp = randomstring.generate({
        length: 4,
        charset: "numeric",
        min: 1000,
        max: 9999,
    });

    try {
        await otpService.createOTP(phone_number ,otp);

        const mailOptions = {
            from: "Dịch vụ chuyển phát nhanh TDLogistics",
            to: email,
            subject: "Xác thực OTP cho ứng dụng TDLogistics",
            html: `<p>OTP xác thực:<br><br>
            <strong style="font-size: 20px; color: red;">${otp}</strong>
            <br><br>
            Quý khách vui lòng không tiết lộ OTP cho bất kỳ ai. OTP sẽ hết hạn sau 5 phút nữa.
            <br><br>
            Xin cảm ơn quý khách,<br>
            Đội ngũ kỹ thuật TDLogistics.
            </p>`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).send(error.message);
            }

            return res.status(200).send("OTP được gửi thành công. Vui lòng kiểm tra số điện thoại và email để xác thực.");
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const verifyOTPMiddleware = async (phone_number, otp) => {
    return await otpService.verifyOTP(phone_number, otp);
}

module.exports = {
    createOTP,
    verifyOTPMiddleware,
}