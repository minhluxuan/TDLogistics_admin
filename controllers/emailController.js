const nodemailer = require("nodemailer");
const Validation = require("../lib/validation");
const EmailValidation = new Validation.EmailValidation();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASSWORD,
    },
});
const createNewEmail = async (req, res) => {
    try {
        const { error } = EmailValidation.validateCreateEmail(req.body);
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin email không hợp lệ",
            });
        }
        const { email, subject, content } = req.body;

        // send emails retủn promise
        const emailPromises = email.map(async (this_email) => {
            const mailOptions = {
                from: "Dịch vụ chuyển phát nhanh TDLogistics",
                to: this_email,
                subject: subject,
                html: content,
            };

            try {
                await transporter.sendMail(mailOptions);
                return { success: true, email: this_email };
            } catch (error) {
                return { success: false, email: this_email, error: error.message };
            }
        });

        const results = await Promise.all(emailPromises);

        let failedEmails = results.filter((result) => !result.success);

        if (failedEmails.length > 0) {
            let failedEmailAddresses = failedEmails.map((result) => result.email);
            return res.status(500).json({
                error: true,
                message: `Gửi một số email không thành công`,
                failedEmails: failedEmailAddresses,
            });
        } else {
            return res.status(200).json({
                error: false,
                message: `Gửi emails thành công`,
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

module.exports = { createNewEmail, deleteEmail };
