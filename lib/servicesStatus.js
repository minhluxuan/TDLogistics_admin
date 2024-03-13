const deliverd_success = {
    code: 1,
    message: "Giao hàng thành công"
}

const processing = {
    code: 2,
    message: "Đang được xử lí"
}

const taking = {
    code: 3,
    message: "Chờ lấy hàng"
}

const taken_success = {
    code: 4,
    message: "Lấy hàng thành công"
}

const taken_fail = {
    code: 5,
    message: "Lấy hàng thất bại"
}

const delivering = {
    code: 6,
    message: "Đang giao tới người nhận"
}

const delivered_cancel = {
    code: 7,
    message: "Đã hủy yêu cầu giao hàng"
}

const deliverd_fail = {
    code: 8,
    message: "Giao hàng thất bại"
}

const refunding = {
    code: 9,
    message: "Đang hoàn hàng"
}

const refunded_sucess = {
    code: 10,
    message: "Hoàn hàng thành công"
}

const refunded_fail = {
    code: 11,
    message: "Hoàn hàng thất bại"
}

const enter_agency = {
    code: 12,
    message: "Đã tới bưu cục"
}

const leave_agency = {
    code: 13, 
    message: "Đã rời bưu cục"
}

const third_party_delivery = {   
    code: 14,
    message: "Kiện hàng được chuyển cho đối tác thứ ba giao"
}

const received = {
    code: 15,
    message: "Đã được tiếp nhận."
}

const statusMessage = {
    [deliverd_success.code]: deliverd_success.message,
    [processing.code]: processing.message,
    [taking.code]: taking.message,
    [taken_success.code]: taken_success.message,
    [taken_fail.code]: taken_fail.message,
    [delivering.code]: delivering.message,
    [delivered_cancel.code]: delivered_cancel.message,
    [deliverd_fail.code]: deliverd_fail.message,
    [refunding.code]: refunding.message,
    [refunded_sucess.code]: refunded_sucess.message,
    [refunded_fail.code]: refunded_fail.message,
    [enter_agency.code]: enter_agency.message,
    [leave_agency.code]: leave_agency.message,
    [third_party_delivery.code]: third_party_delivery.message,
    [received.code]: received.message,
}

const getStatusMessage = (statusCode) => {
    return statusMessage[statusCode] || "Mã không xác định";
}

module.exports = {
    deliverd_success,
    processing,
    taking,
    taken_success,
    taken_fail,
    delivering,
    delivered_cancel,
    deliverd_fail,
    refunding,
    refunded_sucess,
    refunded_fail,
    enter_agency,
    leave_agency,
    third_party_delivery,
    getStatusMessage
}