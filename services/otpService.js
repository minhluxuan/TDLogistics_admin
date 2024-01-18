const OTP = require("../database/OTP");

const createOTP = async (phone_number, otp) => {
    await OTP.createOTP(phone_number, otp)
}

const verifyOTP = async (phone_number, otp) => {
    return await OTP.verifyOTP(phone_number, otp);
}

module.exports = {
    createOTP,
    verifyOTP,
}