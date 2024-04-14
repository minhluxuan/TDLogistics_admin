const PayOS = require("@payos/node");
require('dotenv').config();

const payOS = new PayOS(process.env.PAYOS_CLIENT_ID, process.env.PAYOS_API_KEY, process.env.PAYOS_CHECKSUM_KEY); 

const createPaymentService = async (orderId, total, script) => {
    
    const body = {
        orderCode: orderId,     // mã đơn hàng
        amount: total,          // tổng số tiền thanh toán
        description: script,    // thông tin chuyển khoản 
        cancelUrl: "https://api.tdlogistics.net.vn/api/v1/payment/cancel_payment",
        returnUrl: "https://api.tdlogistics.net.vn/api/v1/payment/payment_successful",
        signature: "abcdef"
    };
    const result = await payOS.createPaymentLink(body)
    return result ;
};
 
// lấy thông tin thanh toán đơn hàng bằng mã đơn hàng từ trang PayOS
const getPaymentInformation = async (orderId) => {
  	return await payOS.getPaymentLinkInformation(orderId);
};


module.exports = {
    createPaymentService,
    getPaymentInformation,
}