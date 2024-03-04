const shippersService = require("../services/shippersService");
const utils = require("../lib/utils");

const getTasks = async (req, res) => {
    try {
        const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);

        req.body.staff_id = req.user.staff_id;
        const resultGettingTasks = await shippersService.getTasks(req.body, postalCode);
        
        return res.status(200).json({
            error: false,
            data: resultGettingTasks,
            message: `Lấy công việc của bưu tá có mã ${req.user.staff_id} thành công.`,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

module.exports = {
    getTasks,
}