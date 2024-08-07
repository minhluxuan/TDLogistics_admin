const vehicleService = require("../services/vehicleService");
const partnerStaffService = require("../services/partnerStaffsService");
const agenciesService = require("../services/agenciesService");
const staffsService = require("../services/staffsService");
const driversService = require("../services/driversService");
const shipmentsService = require("../services/shipmentsService");
const validation = require("../lib/validation");
const utils = require("../lib/utils");
const moment = require("moment");

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
            const resultCheckingExistTransportPartnerAndStaff = await partnerStaffService.checkExistPartnerStaffIntersect({ partner_id: req.body.transport_partner_id, staff_id: req.body.staff_id });
            if (!resultCheckingExistTransportPartnerAndStaff.existed) {
                return res.status(404).json({
                    error: true,
                    message: `Nhân viên có mã ${req.body.staff_id} không tồn tại hoặc không thuộc đối tác vận tải có mã ${req.body.transport_partner_id}.`,
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

            const vehicles = await vehicleService.getVehicle(req.body, paginationConditions);

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

            const vehicles = await vehicleService.getVehicle(req.body, paginationConditions);

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

const getVehicleShipmentIds = async (req, res) => {
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

        const result = await vehicleService.getVehicleShipmentIds(resultGettingOneVehicle[0]);

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
        const { error: error1 } = vehicleValidation.validateCheckingExistVehicle(req.query);
        if (error1) {
            return res.status(400).json({
                error: true,
                message: error1.message,
            });
        }

        const { error: error2 } = vehicleValidation.validateShipmentIds(req.body);
        if (error2) {
            return res.status(400).json({
                error: true,
                message: error2.message,
            });
        }

        const resultGettingOneVehicle = await vehicleService.getOneVehicle({ vehicle_id: req.query.vehicle_id });

        if (!resultGettingOneVehicle || resultGettingOneVehicle.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        const result = await vehicleService.addShipmentToVehicle(resultGettingOneVehicle[0], req.body.shipment_ids);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã phương tiện ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        return res.status(201).json({
            error: false,
            info: result,
            message: "Thêm thành công.",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
}

const deleteShipmentFromVehicle = async (req, res) => {
    try {
        const { error: error1 } = vehicleValidation.validateCheckingExistVehicle(req.query);
        if (error1) {
            return res.status(400).json({
                error: true,
                message: error1.message,
            });
        }

        const { error: error2 } = vehicleValidation.validateShipmentIds(req.body);
        if (error2) {
            return res.status(400).json({
                error: true,
                message: error2.message,
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

const undertakeShipment = async (req, res) => {
    try {
        const formattedTime = moment(new Date()).format("DD-MM-YYYY HH:mm:ss");

        const { error } = vehicleValidation.validateUndertakeShipment(req.query);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }
        console.log(req.query.shipment_id, req.user.staff_id);
        const resultGettingOneTask = await driversService.getOneTask({ shipment_id: req.query.shipment_id, staff_id: req.user.staff_id });
        console.log(resultGettingOneTask);
        if (!resultGettingOneTask || resultGettingOneTask.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Nhân viên có mã ${req.user.staff_id} không được phép tiếp nhận lô hàng có mã ${req.query.shipment_id}.`,
            });
        }

        const resultGettingOneShipment = await shipmentsService.getOneShipment({ shipment_id: req.query.shipment_id });
        if (!resultGettingOneShipment || resultGettingOneShipment.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Lô hàng ${req.query.shipment_id} không tồn tại để có thể tiếp nhận.`,
            });
        }

        if (resultGettingOneShipment[0].status < 3) {
            return res.status(409).json({
                error: true,
                message: `Lô hàng có mã ${req.query.shipment_id} không khả thi để tiếp nhận vào thời điểm này.
                Yêu cầu trạng thái trước đó: "Đã phân công".`,
            });
        }

        if (resultGettingOneShipment[0].status >= 4) {
            return res.status(409).json({
                error: true,
                message: `Lô hàng có mã ${req.query.shipment_id} đã được tiếp nhận trước đó.`,
            });
        }

        await shipmentsService.updateShipment({ status: 4, parent: resultGettingOneTask[0].vehicle_id }, { shipment_id: req.query.shipment_id });
        const message = `${formattedTime}: Lô hàng được tiếp nhận bởi nhân viên có mã ${req.user.staff_id} thuộc đối tác vận tải có mã ${req.user.partner_id} và đang được vận chuyển trên phương tiện có mã ${resultGettingOneTask[0].vehicle_id}.`;
        await shipmentsService.updateJourney(req.query.shipment_id, formattedTime, message);
        await shipmentsService.updateJourney(req.query.shipment_id, formattedTime, message, utils.getPostalCodeFromAgencyID(resultGettingOneShipment[0].agency_id));
        if (resultGettingOneShipment[0].agency_id_dest) {
            await shipmentsService.updateJourney(req.query.shipment_id, formattedTime, message, utils.getPostalCodeFromAgencyID(resultGettingOneShipment[0].agency_id_dest));
        }
        
        return res.status(200).json({
            error: false,
            message: `Tiếp nhận đơn hàng có mã ${req.query.shipment_id} thành công.`,
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
    getVehicleShipmentIds,
    updateVehicle,
    deleteVehicle,
    addShipmentToVehicle,
    deleteShipmentFromVehicle,
    undertakeShipment,
};
