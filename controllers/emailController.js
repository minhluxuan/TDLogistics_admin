const nodemailer = require("nodemailer");
const Validation = require("../lib/validation");
const EmailValidation = new Validation.EmailValidation();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "minhfaptv@gmail.com",
        pass: "zuko cgyk uvfj lfnt",
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
        console.log("here");

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
                console.log({ email: this_email });
                return { success: true, email: this_email };
            } catch (error) {
                console.log(error);
                return { success: false, email: this_email, error: error.message };
            }
        });

        const results = await Promise.allSettled(emailPromises);
        console.log(results);

        let failedEmails = results.filter((result) => {
            return results.status === "rejected";
        });

        if (failedEmails.length > 0) {
            let failedEmailAddresses = failedEmails.map((result) => result.value.email);
            return res.status(500).json({
                error: true,
                message: `Gửi một số email không thành công`,
                failedEmails: failedEmailAddresses,
            });
        } else {
            let successEmailAddresses = results
                .filter((result) => {
                    return result.status === "fulfilled";
                })
                .map((result) => result.value.email);
            console.log(successEmailAddresses);
            return res.status(200).json({
                error: false,
                message: `Gửi emails thành công`,
                successEmail: successEmailAddresses,
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: "undefined error",
            message: error.message,
        });
    }
};

module.exports = { createNewEmail };
