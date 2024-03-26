const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const otpService = require("../services/otpService");
const usersService = require("../services/usersService");
const Validation = require("../lib/validation");

const OTPValidation = new Validation.OTPValidation();
const UserValidation = new Validation.UserValidation();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASSWORD,
    }
});
const getAuthenticatedUserInfo = async (req, res) => {
	try {
        const User = await usersService.getOneUser({ user_id: req.user.user_id });
        if(!User || User.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Người dùng có mã ${req.user.user_id} không tồn tại.`
            });
        }
		const info = new Object({
			fullname: User[0].fullname,
            phone_number: User[0].phone_number,
            email: User[0].email,
            role: "USER"
		});
		return res.status(200).json(new Object({
			error: false,
			info: info,
			message: `Lấy thông tin người dùng thành công`,
		}));
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}
const createOTP = async (req, res) => {
    const { error } = OTPValidation.validateSendingOTP(req.body);

    if (error) {
        return res.status(400).json({
            error: true,
            message: error.message,
        });
    }

    const { phone_number, email } = req.body;

    const otp = randomstring.generate({
        length: 4,
        charset: "numeric",
        min: 1000,
        max: 9999,
    });

    try {
        await otpService.createOTP(phone_number, otp);

        const mailOptions = {
            from: "Dịch vụ chuyển phát nhanh TDLogistics",
            to: email,
            subject: "Xác thực OTP cho ứng dụng TDLogistics",
            html: `<p>OTP của quý khách là:<br><br>
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
                return res.status(500).send("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút.");
            }

            return res.status(200).send("OTP được gửi thành công. Vui lòng kiểm tra số điện thoại và email để xác thực.");
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút.",
        });
    }
}

const verifyOTPMiddleware = async (phone_number, otp) => {
    return await otpService.verifyOTP(phone_number, otp);
}

const checkExistUser = async (req, res) => {
    try {
        const { error } = UserValidation.validateCheckingExistUser(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const existed = await usersService.checkExistUser(req.body);

        return res.status(200).json({
            error: false,
            existed: existed,
            message: existed ? "Số điện thoại đã tồn tại." : "Số điện thoại chưa tồn tại.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const createNewUser = async (req, res) => {
    try {
        const { error } = UserValidation.validateCreatingUser(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (await usersService.checkExistUser({ phone_number: req.body.phone_number })) {
            return res.status(400).json({
                error: true,
                message: "Số điện thoại đã tồn tại!",
            });
        }

        req.body.user_id = "PU" + "_00000_" + req.body.phone_number; 

        const resultCreatingNewUser = await usersService.createNewUser(req.body);

        if (!resultCreatingNewUser || resultCreatingNewUser.affectedRows === 0) {
            return res.status(409).json({
                error: true,
                message: "Tạo người dùng mới thất bại.",
            });
        }

        return res.status(201).json({
            error: false,
            message: "Tạo người dùng mới thành công!",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getOneUser = async (req, res) => {
    try {
        const result = await usersService.getOneUser({ phone_number: req.user.phone_number });

        return res.status(200).json({
            error: false,
            data: result,
            message: "Lấy dữ liệu thành công!",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const updateUserInfo = async (req, res) => {
    try {
        const { error } = UserValidation.validateUpdatingUser(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultUpdatingUser = await usersService.updateUserInfo(req.body, { phone_number: req.user.phone_number });

        if (!resultUpdatingUser || resultUpdatingUser.affectedRows <= 0) {
            return res.status(409).json({
                error: true,
                message: "Cập nhật thông tin người dùng thất bại!",
            });
        }

        return res.status(201).json({
            error: false,
            message: "Cập nhật thành công!",
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie("connect.sid");
        req.logout(() => {
            req.session.destroy();
        });

        res.status(200).json({
            error: false,
            message: "Đăng xuất thành công.",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Đã xảy ra lỗi. Vui lòng thử lại.",
        });
    }
};

module.exports = {
    getAuthenticatedUserInfo,
    createOTP,
    verifyOTPMiddleware,
    checkExistUser,
    getOneUser,
    createNewUser,
    updateUserInfo,
    logout,
}
