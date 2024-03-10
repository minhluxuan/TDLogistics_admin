const vehicleService = require("../services/vehicleService");
const partnerStaffService = require("../services/partnerStaffsService");
const agenciesService = require("../services/agenciesService");
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
        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			const { error } = vehicleValidation.validateCreatingVehicleByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			if (!(await agenciesService.checkExistAgency({ agency_id: req.body.agency_id }))) {
				return res.status(404).json({
					error: true,
					message: `Bưu cục có mã bưu cục ${req.body.agency_id} không tồn tại.`,
				});
			}
		}
		else if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			const { error } = businessValidation.validateCreatingVehicleByAgency(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			req.body.agency_id = req.user.agency_id;
		}

        const resultCheckingExistAgencyAndStaff = await staffsService.checkExistStaffIntersect({ agency_id: req.body.agency_id, staff_id: req.body.staff_id });
        if (!resultCheckingExistAgencyAndStaff.existed) {
            return res.status(404).json({
                error: true,
                message: `Nhân viên có mã nhân viên ${req.body.staff_id} không tồn tại trong bưu cục có mã bưu cục ${req.body.agency_id}.`,
            });
        }

        const existed = await vehicleService.checkExistVehicle({ license_plate: req.body.license_plate });

        if (existed) {
            return res.status(409).json({
                error: true,
                message: `Phương tiện có mã hiệu ${req.body.license_plate} đã tồn tại.`,
            });
        }

        const agencyIdSubParts = req.body.agency_id.split('_');
        const modifiedLicensePlate = req.body.license_plate.replace(new RegExp("[-\\s]", 'g'), '');
        req.body.vehicle_id = agencyIdSubParts[0] + '_' + agencyIdSubParts[1] + '_' + modifiedLicensePlate;

        if (req.body.hasOwnProperty("transport_partner_id")) {
            const existed = await partnerStaffService.checkExistPartnerStaff({ transport_partner_id: req.body.transport_partner_id });

            if (!existed) {
                return res.status(404).json({
                    error: true,
                    message: `Đối tác vận tải có mã đối tác ${req.body.transport_partner_id} không tồn tại.`,
                });
            }
        }

        const resultCreatingNewVehicle = await vehicleService.createNewVehicle(req.body);
            
        if (!resultCreatingNewVehicle || resultCreatingNewVehicle.affectedRows <= 0) {
            return res.status(409).json({
                error: true,
                message: `Tạo phương tiện vận tải có mã hiệu ${req.body.license_plate} thất bại.`,
            });
        }

        return res.status(201).json({
            error: false,
            message: `Tạo phương tiện vận tải có mã hiệu ${req.body.license_plate} thành công.`,
        });
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
        const paginationConditions = { rows: 0, page: 0 };

        if (req.query.rows) {
            paginationConditions.rows = parseInt(req.query.rows);
        }

        if (req.query.page) {
            paginationConditions.page = parseInt(req.query.page);
        }

        const { error: paginationError } = vehicleValidation.validatePaginationConditions(paginationConditions);
        if (paginationError) {
            return res.status(400).json({
                error: true,
                message: paginationError.message,
            });
        }

        if (["DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER", "PARTNER_DRIVER", "PARTNER_SHIPPER"].includes(req.user.role)) {
            const { error } = vehicleValidation.validateFindingVehicleByStaff(req.query);

            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            const vehicle = await vehicleService.getOneVehicle(req.body);
            
            return res.status(200).json({
                error: false,
                result: vehicle,
                message: "Lấy thông tin phương tiện thành công.",
            });
        }

        if (req.user.role === "TRANSPORT_PARTNER_REPRESENTOR") {
            const { error } = vehicleValidation.validateFindingVehicle(req.body);

            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            req.body.transport_partner_id = req.user.transport_partner_id;

            const vehicles = await vehicleService.getVehicle(req.body, paginationConditions);

            return res.status(200).json({
                error: false,
                result: vehicles,
                message: "Lấy thông tin phương tiện thành công.",
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER"].includes(req.user.role)) {
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

        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER"].includes(req.user.role)) {
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


const updateVehicle = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateCheckingExistVehicle(req.query) || vehicleValidation.validateUpdatingVehicle(req.body);
        
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const updatorIdSubParts = req.user.staff_id.split('_');
		const vehicleIdSubParts = req.query.vehicle_id.split('_');

		if ((["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role))
		&& (updatorIdSubParts[0] !== vehicleIdSubParts[0] ||
            updatorIdSubParts[1] !== vehicleIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
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

        const deletorIdSubParts = req.user.staff_id.split('_');
		const vehicleIdSubParts = req.query.vehicle_id.split('_');

		if ((["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role))
		&& (deletorIdSubParts[0] !== vehicleIdSubParts[0] ||
            deletorIdSubParts[1] !== vehicleIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
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


const addShipmentToVehicle = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateCheckingExistVehicle(req.query) || vehicleValidation.validateUpdatingVehicle(req.body);
        
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }

        const updatorIdSubParts = req.user.staff_id.split('_');
		const vehicleIdSubParts = req.query.vehicle_id.split('_');

		if ((["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role))
		&& (updatorIdSubParts[0] !== vehicleIdSubParts[0] ||
            updatorIdSubParts[1] !== vehicleIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

        const resultGettingOneVehicle = await vehicleService.getOneVehicle({ vehicle_id: req.query.vehicle_id });

        if (!resultGettingOneVehicle || resultGettingOneVehicle.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        const result = await vehicleService.addShipmentToVehicle(resultGettingOneVehicle[0], req.body.shipment_ids);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: "Phương tiện không tồn tại.",
            });
        }

        return res.status(201).json({
            error: false,
            info: result,
            message: "Thêm thành công.",
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
}

const deleteShipmentFromVehicle = async (req, res) => {
    try {
        const { error } = vehicleValidation.validateCheckingExistVehicle(req.query) || vehicleValidation.validateOrderIds(req.body);
    
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }

        const deletorIdSubParts = req.user.staff_id.split('_');
		const vehicleIdSubParts = req.query.vehicle_id.split('_');

		if ((["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role))
		&& (deletorIdSubParts[0] !== vehicleIdSubParts[0] ||
            deletorIdSubParts[1] !== vehicleIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

        const resultGettingOneVehicle = await vehicleService.getOneVehicle({ vehicle_id: req.query.vehicle_id });

        if (!resultGettingOneVehicle || resultGettingOneVehicle.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        const result = await vehicleService.deleteShipmentFromVehicle(resultGettingOneVehicle[0], req.body.shipment_ids);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        return res.status(201).json({
            error: false,
            info: result,
            message: "Xóa thành công.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

module.exports = {
    checkExistVehicle,
    createNewVehicle,
    getVehicle,
    getVehicleOrderIds,
    updateVehicle,
    // addOrders,
    // deleteOrders,
    deleteVehicle,
    addShipmentToVehicle,
    deleteShipmentFromVehicle,
};
