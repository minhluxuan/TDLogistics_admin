const validation = require("../lib/validation");

const sendMessage = async (req, res) => {
    print(req);
    res.status(200).json({
        error: false,
        message: "Gửi tin nhắn thành công.",
    });
};

module.exports = { sendMessage };
