const vehicleService = require("../services/vehicleService");
const validation = require("../lib/validation");
const fs = require("fs");
const path = require("path");

const vehicleValidation = new validation.VehicleValidation();

const checkExistVehicle = async (req, res) => {
    const { error } = vehicleValidation.validateCheckingExistVehicle(req.query);

    if (error) {
        return res.status(400).json({
            error: true,
            message: "Phương tiện không tồn tại.",
        });
    }

    try {
        const existed = await vehicleService.checkExistVehicle(Object.keys(req.query), Object.values(req.query));
        
        return res.status(200).json({
            error: false,
            existed: existed,
            message: existed ? "Vehicle already exists." : "Vehicle does not exist.",
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const createNewVehicle = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateCreatingVehicle(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                // message: "Thông tin không hợp lệ.",
                message: error.message,
            });
        }

        const existed = await vehicleService.checkExistVehicle(["license_plate"], [req.body.license_plate]);

        if (existed) {
            return res.status(400).json({
                error: true,
                message: "Phương tiện đã tồn tại.",
            });
        }

        const keys = Object.keys(req.body);
        const values = Object.values(req.body);

        const result = await vehicleService.createNewVehicle(keys, values);

        if (!result || result[0].affectedRows <= 0) {
            return res.status(500).json({
                error: false,
                message: "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút.",
            });
        }

        return res.status(200).json({
            error: false,
            message: "Thêm phương tiện thành công.",
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const getVehicle = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateFindingVehicle(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }

        const fields = Object.keys(req.body);
        const values = Object.values(req.body);

        const result = await vehicleService.getVehicle(fields, values);

        return res.status(200).json({
            error: true,
            data: result,
            message: "Lấy thông tin phương tiện thành công.",
        });
    } catch (error) {
        console.error("Error in getVehicleController: ", error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const getVehicleOrderIds = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateGettingOrderIds(req.query);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }

        const result = await vehicleService.getVehicleOrderIds(Object.keys(req.query), Object.values(req.query));

        return res.status(200).json({
            error: true,
            data: result,
            message: "Lấy thông tin thành công.",
        });
    } catch (error) {
        console.error("Error in getVehicleOrderIDController: ", error);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

const addOrders = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateCheckingExistVehicle(req.query) || vehicleValidation.validateOrderIds(req.body);
    
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }

        const result = await vehicleService.addOrders(req.query.vehicle_id, req.body.order_ids);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: "Phương tiện không tồn tại.",
            });
        }

        res.status(201).json({
            error: false,
            info: result,
            message: "Thêm thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const deleteOrders = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateCheckingExistVehicle(req.query) || vehicleValidation.validateOrderIds(req.body);
    
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }

        const result = await vehicleService.deleteOrders(req.query.vehicle_id, req.body.order_ids);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: "Phương tiện không tồn tại.",
            });
        }

        res.status(201).json({
            error: false,
            info: result,
            message: "Xoá thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const updateVehicle = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateCheckingExistVehicle(req.query) || vehicleValidation.validateUpdatingVehicle(req.body);
        
        if (error) {
            return res.status(400).json({
                error: true,
                // message: "Thông tin không hợp lệ.",
                message: error.message,
            });
        }

        const keys = Object.keys(req.body);
        const values = Object.values(req.body);

        const result = await vehicleService.updateVehicle(keys, values, ["vehicle_id"], [req.query.vehicle_id]);

        if (!result || result.length <= 0) {
            return res.status(404).json({
                error: true,
                message: "Phương tiện không tồn tại.",
            });
        }

        res.status(201).json({
            error: false,
            message: "Cập nhật thông tin phương tiện thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const deleteVehicle = async (req, res) => {
    const { err } = vehicleValidation.validateDeletingVehicle(req.query.vehicle_id);
    
    if (err) {
        return res.status(400).json({
            error: true,
            message: "Thông tin không hợp lệ.",
        });
    }

    try {
        const result = await vehicleService.deleteVehicle(["vehicle_id"], [req.query.vehicle_id]);
        
        if (!result || result.length <= 0) {
            return res.status(404).json({
                error: true,
                message: "Phương tiện không tồn tại.",
            });
        }

        return res.status(200).json({
            error: false,
            message: "Xóa phương tiện thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};
module.exports = {
    checkExistVehicle,
    createNewVehicle,
    getVehicle,
    getVehicleOrderIds,
    updateVehicle,
    addOrders,
    deleteOrders,
    deleteVehicle
};
