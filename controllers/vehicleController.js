const vehicleService = require("../services/vehicleService");
const partnerStaffService = require("../services/partnerStaffsService");
const staffsService = require("../services/staffsService");
const validation = require("../lib/validation");
const fs = require("fs");
const path = require("path");

const vehicleValidation = new validation.VehicleValidation();

const checkExistVehicle = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateCheckingExistVehicle(req.query);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const existed = await vehicleService.checkExistVehicle(req.query);
        
        return res.status(200).json({
            error: false,
            existed: existed,
            message: existed ? `Phương tiện có mã hiệu ${req.body.license_plate} đã tồn tại.` : `Phương tiện có mã hiệu ${req.body.license_plate} chưa tồn tại.`,
        });
    } catch (error) {
        console.log(error);
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
                message: error.message,
            });
        }

        const existed = await vehicleService.checkExistVehicle({ license_plate: req.body.license_plate });

        if (existed) {
            return res.status(400).json({
                error: true,
                message: `Phương tiện có mã hiệu ${req.body.license_plate} đã tồn tại.`,
            });
        }

        const creatorIdSubParts = req.user.staff_id.split('_');
        const modifiedLicensePlate = req.body.license_plate.replace(new RegExp("[-\\s]", 'g'), '');
        req.body.vehicle_id = creatorIdSubParts[0] + '_' + creatorIdSubParts[1] + '_' + modifiedLicensePlate;
        req.body.agency_id = req.user.agency_id;

        if (req.body.hasOwnProperty("transport_partner_id")) {
            const existed = await partnerStaffService.checkExistPartnerStaff({ staff_id: req.body.staff_id });

            if (!existed) {
                return res.status(404).json({
                    error: true,
                    message: `Nhân viên có mã nhân viên ${req.body.staff_id} của đối tác vận tải có mã đối tác ${req.body.transport_partner_id} không tồn tại.`,
                });
            }

            const resultCreatingNewVehicle = await vehicleService.createNewVehicle(req.body);
            
            let textResultCreatingNewVehicle;
            if (!resultCreatingNewVehicle || resultCreatingNewVehicle.affectedRows <= 0) {
                textResultCreatingNewVehicle = `Tạo phương tiện vận tải có mã hiệu ${req.body.license_plate} không thành công.`;
            }
            else {
                textResultCreatingNewVehicle = `Tạo phương tiện vận tải có mã hiệu ${req.body.license_plate} thành công.`;
            }

            return res.status(201).json({
                error: false,
                message: "Thêm phương tiện thành công.",
            });
        }
        else {
            const existed = await staffsService.checkExistStaff({ staff_id: req.body.staff_id });

            if (!existed) {
                return res.status(404).json({
                    error: true,
                    message: `Nhân viên có mã nhân viên ${req.body.staff_id} chưa tồn tại.`,
                });
            }

            const resultCreatingNewVehicle = await vehicleService.createNewVehicle(req.body);

            let textResultCreatingNewVehicle;
            if (!resultCreatingNewVehicle || resultCreatingNewVehicle.affectedRows <= 0) {
                textResultCreatingNewVehicle = `Tạo phương tiện vận tải có mã hiệu ${req.body.license_plate} không thành công.`;
            }
            else {
                textResultCreatingNewVehicle = `Tạo phương tiện vận tải có mã hiệu ${req.body.license_plate} thành công.`;
            }

            return res.status(201).json({
                error: false,
                message: `Kết quả:\n
                ${textResultCreatingNewVehicle}`,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const getVehicle = async (req, res) => {
    try {
        if (req.user.role === "PARTNER_STAFF_DRIVER" || req.user.role === "PARTNER_STAFF_SHIPPER"
        || req.user.role === "DRIVER" || req.user.role === "SHIPPER") {
            const { error } = vehicleValidation.validateFindingVehicleByStaff(req.query);

            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            const vehicle = await vehicleService.getOneVehicle(req.query);
            
            return res.status(200).json({
                error: false,
                result: vehicle,
                message: "Lấy thông tin phương tiện thành công.",
            });
        }

        if (req.user.role === "TRANSPORT_PARTNER") {
            const { error } = vehicleValidation.validateFindingVehicle(req.body);

            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                }); 
            }

            req.body.transport_partner_id = req.user.transport_partner_id;

            const vehicles = await vehicleService.getVehicle(req.body);

            return res.status(200).json({
                error: false,
                result: vehicles,
                message: "Lấy thông tin phương tiện thành công.",
            });
        }

        if (req.user.role === "AGENCY_MANAGER" || req.user.role === "AGENCY_TELLER") {
            const { error } = vehicleValidation.validateFindingVehicle(req.body);

            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                }); 
            }

            req.body.agency_id = req.user.agency_id;

            const vehicles = await vehicleService.getVehicle(req.body);

            return res.status(200).json({
                error: false,
                result: vehicles,
                message: "Lấy thông tin phương tiện thành công.",
            });
        }

        if (req.user.role === "ADMIN") {
            const { error } = vehicleValidation.validateFindingVehicle(req.body);

            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            const vehicles = await vehicleService.getVehicle(req.body);

            return res.status(200).json({
                error: true,
                data: vehicles,
                message: "Lấy thông tin phương tiện thành công.",
            });
        }
    } catch (error) {
        console.log(error);
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
                message: error.message,
            });
        }

        const resultGettingOneVehicle = await vehicleService.getOneVehicle({ vehicle_id: req.query.vehicle_id });

        if (!resultGettingOneVehicle || resultGettingOneVehicle.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        const result = await vehicleService.getVehicleOrderIds(resultGettingOneVehicle[0]);

        return res.status(200).json({
            error: true,
            data: result,
            message: "Lấy thông tin thành công.",
        });
    } catch (error) {
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

        const resultGettingOneVehicle = await vehicleService.getOneVehicle({ vehicle_id: req.query.vehicle_id });

        if (!resultGettingOneVehicle || resultGettingOneVehicle.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        const result = await vehicleService.addOrders(resultGettingOneVehicle[0], req.body.order_ids);

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
        console.log(error);
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

        const resultGettingOneVehicle = await vehicleService.getOneVehicle({ vehicle_id: req.query.vehicle_id });

        if (!resultGettingOneVehicle || resultGettingOneVehicle.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        const result = await vehicleService.deleteOrders(resultGettingOneVehicle[0], req.body.order_ids);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        res.status(201).json({
            error: false,
            info: result,
            message: "Thêm thành công.",
        });
    } catch (error) {
        console.log(error);
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
                message: error.message,
            });
        }

        if (req.user.role === "AGENCY_MANAGER" || req.user.role === "AGENCY_TELLER") {
            req.body.agency_id = req.user.agency_id;
        }

        const result = await vehicleService.updateVehicle(req.body, req.query);

        if (!result || result.affectedRows <= 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        res.status(201).json({
            error: false,
            message: `Cập nhật thông tin cho phương tiện có mã phương tiện ${req.query.vehicle_id} thành công.`,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateDeletingVehicle(req.query);
        
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (req.user.role === "AGENCY_MANAGER" || req.user.role === "AGENCY_TELLER") {
            req.body.agency_id = req.user.agency_id;
        }

        const result = await vehicleService.deleteVehicle(req.query);
        
        if (!result || result.affectedRows <= 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        return res.status(200).json({
            error: false,
            message: `Xóa phương tiện có mã phương tiện ${req.query.vehicle_id} thành công.`,
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
