const adminstrativeService = require("../services/administrativeService");
const validation = require("../lib/validation");
const administrativeValidation = new validation.AdministrativeUnit();

const getUnits = async (req, res) => {
    const { error } = administrativeValidation.validateGettingUnit(req.body);
    
    if(error) {
        return res.status(400).json({
            error: true,
            message: "Thông tin không hợp lệ.",
        });
    }

    if(!req.body.province) {
        const result = await adminstrativeService.getUnits(1);
        return res.status(200).json({
            error: (result.success ? false : true),
            data: result.data,
            message: (result.success ? "Lấy thông tin đơn vị hành chính thành công" : "Lấy thông tin đơn vị hành chính thất bại")
        });
    }
    else if(!req.body.district) {
        const result = await adminstrativeService.getUnits(2, req.body.province);
        return res.status(200).json({
            error: (result.success ? false : true),
            data: result.data,
            message: (result.success ? "Lấy thông tin đơn vị hành chính thành công" : "Lấy thông tin đơn vị hành chính thất bại")
        });
    }
    else {
        const result = await adminstrativeService.getUnits(3, req.body.province, req.body.district);
        return res.status(200).json({
            error: (result.success ? false : true),
            data: result.data,
            message: (result.success ? "Lấy thông tin đơn vị hành chính thành công" : "Lấy thông tin đơn vị hành chính thất bại")
        });
    }
}

module.exports = {
    getUnits
}