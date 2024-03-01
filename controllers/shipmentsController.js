const moment = require("moment");
const shipmentService = require("../services/shipmentsService");
const validation = require("../lib/validation");
const utils = require("../lib/utils");
const transportPartnerService = require("../services/transportPartnerService");
const servicesStatus = require("../lib/servicesStatus");
const shipmentRequestValidation = new validation.ShipmentValidation();

const createNewShipment = async (req, res) => {
    try {
        const createdTime = new Date();
        const { error } = shipmentRequestValidation.validateCreatingShipment(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (req.body.hasOwnProperty("transport_partner_id")) {
            if (!(await transportPartnerService.checkExistPartner({ transport_partner_id: req.body.transport_partner_id }))) {
                return res.status(404).json({
                    error: true,
                    message: `Đối tác vận tải có mã đối tác ${req.body.transport_partner_id} không tồn tại.`,
                });
            }
        }

        const areaAgencyIdSubParts = req.user.agency_id.split('_');
        req.body.shipment_id = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + createdTime.getFullYear().toString() + createdTime.getMonth().toString() + createdTime.getDate().toString() + createdTime.getHours().toString() + createdTime.getMinutes().toString() + createdTime.getSeconds().toString() + createdTime.getMilliseconds().toString();
        
        if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);
            const resultCreatingShipmentForAgency = await shipmentService.createNewShipment(req.body, postalCode);
            
            if (!resultCreatingShipmentForAgency || resultCreatingShipmentForAgency.affectedRows === 0) {
                return res.status(409).json({
                    error: true,
                    message: `Tạo lô hàng có mã lô ${req.body.shipment_id} cho bưu cục ${req.user.agency_id} thất bại.`,
                });
            }
            
            return res.status(201).json({
                error: true,
                message: `Tạo lô hàng có mã lô ${req.body.shipment_id} cho bưu cục ${req.user.agency_id} thành công.`,
            });
        }
        else if (["ADMIN", "AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const resultCreatingShipment = await shipmentService.createNewShipment(req.body);console.log(resultCreatingShipment);
            
            if (!resultCreatingShipment || resultCreatingShipment.affectedRows === 0) {
                return res.status(409).json({
                    error: true,
                    message: `Tạo lô hàng có mã lô ${req.body.shipment_id} thất bại.`,
                });
            }
            
            return res.status(201).json({
                error: true,
                message: `Tạo lô hàng có mã lô ${req.body.shipment_id} thành công.`,
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
}

const updateShipment = async (req, res) => {
    try {
        const { error } = shipmentRequestValidation.validateQueryUpdatingShipment(req.query) && shipmentRequestValidation.validateUpdatingShipment(req.body);
            
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);

            const resultUpdateShipmentForAgency = await shipmentService.updateShipmentForAgency(req.body, req.query, postalCode);
            
            if (!resultUpdateShipmentForAgency || resultUpdateShipmentForAgency.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment_id} không tồn tại trong bưu cục có mã bưu cục ${agency_id}.`,
                });
            }

            return res.status(201).json({
                error: false,
                message: `Cập nhật lô hàng có mã lô ${req.query.shipment_id} thuộc bưu cục ${agency_id} thành công.`,
            });
        }
        else if (["ADMIN", "MANAGER", "TELLER"].includes(req.user.role)) {            
            const resultUpdateShipment = await shipmentService.updateShipment(req.body, req.query);
            
            if (!resultUpdateShipment || resultUpdateShipment.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã lô ${req.query.shipment_id} không tồn tại trong cơ sở dữ liệu tổng cục.`,
                });
            }

            return res.status(201).json({
                error: false,
                message: `Cập nhật lô hàng có mã lô ${req.query.shipment_id} thành công.`,
            });
        }
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const addOrderToShipment = async (req, res) => {
    try {
        const { error } = shipmentRequestValidation.validateQueryUpdatingShipment(req.query) && shipmentRequestValidation.validateOperationWithOrder(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);

            const resultGettingOneShipmentInAgency = await shipmentService.getOneShipment(req.query, postalCode);
            if (!resultGettingOneShipmentInAgency || resultGettingOneShipmentInAgency.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment_id} không tồn tại trong bưu cục có mã ${agency_id}.`,
                });
            }

            const result = await shipmentService.addOrdersToShipment(resultGettingOneShipmentInAgency[0], req.body.order_ids, postalCode);
            
            return res.status(201).json({
                error: false,
                info: result,
                message: `Thêm đơn hàng vào lô hàng có mã lô ${req.query.shipment_id} thành công.`,
            });
        }
        else if (["ADMIN", "MANAGER", "TELLER"].includes(req.user.role)) {
            const { error } = shipmentRequestValidation.validateQueryUpdatingShipment(req.query) || shipmentRequestValidation.validateOperationWithOrder(req.body);

            if(error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            const resultGettingOneShipment = await shipmentService.getOneShipment(req.query);
            if (!resultGettingOneShipment || resultGettingOneShipment.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment_id} không tồn tại.`,
                });
            }

            const result = await shipmentService.addOrdersToShipment(resultGettingOneShipment[0], req.body.order_ids);
            
            return res.status(201).json({
                error: false,
                info: result,
                message: `Thêm đơn hàng vào lô hàng có mã lô ${req.query.shipment_id} thành công.`,
            });
        }
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const deleteOrderFromShipment = async (req, res) => {
    try {
        const { error } = shipmentRequestValidation.validateQueryUpdatingShipment(req.query) && shipmentRequestValidation.validateOperationWithOrder(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);

            const resultGettingOneShipmentInAgency = await shipmentService.getOneShipment(req.query, postalCode);
            if (!resultGettingOneShipmentInAgency || resultGettingOneShipmentInAgency.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment_id} không tồn tại trong bưu cục có mã ${agency_id}.`,
                });
            }

            const result = await shipmentService.deleteOrdersFromShipment(resultGettingOneShipmentInAgency[0], req.body.order_ids, postalCode);
            
            return res.status(201).json({
                error: false,
                info: result,
                message: `Xóa đơn hàng khỏi lô hàng có mã ${req.query.shipment_id} thành công.`,
            });
        }
        else if (["ADMIN", "MANAGER", "TELLER"].includes(req.user.role)) {
            const { error } = shipmentRequestValidation.validateQueryUpdatingShipment(req.query) || shipmentRequestValidation.validateOperationWithOrder(req.body);

            if(error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            const result = await shipmentService.deleteOrdersFromShipment(resultGettingOneShipment[0], req.body.order_ids);
            
            return res.status(201).json({
                error: false,
                info: result,
                message: `Xóa đơn hàng khỏi lô hàng có mã ${req.query.shipment_id} thành công.`,
            });
        }
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const confirmCreateShipment = async (req, res) => {
    try {
        const { error } = shipmentRequestValidation.validateShipmentID(req.body);
            
        if(error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }
        
        const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);

        const resultGettingOneShipment = await shipmentService.getOneShipment(req.body, postalCode);
        if (!resultGettingOneShipment || resultGettingOneShipment.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Lô hàng có mã ${req.body.shipment_id} không tồn tại trong bưu cục có mã ${req.user.agency_id}.`
            });
        }

        if (await shipmentService.checkExistShipment(req.body)) {
            return res.status(409).json({
                error: true,
                message: `Lô hàng có mã ${req.body.shipment_id} đã tồn tại trong cơ sở dữ liệu tổng cục.`,
            });
        }

        const shipment = resultGettingOneShipment[0];
        if (!shipment.order_ids) {
            return res.status(201).json({
                error: false,
                message: `Tạo lô hàng có mã lô hàng ${req.body.shipment} trên tổng cục thành công.`,
            });
        }

        const resultCloneShipmentFromAgencyToGlobal = await shipmentService.confirmCreateShipment(shipment);
        if (!resultCloneShipmentFromAgencyToGlobal || resultCloneShipmentFromAgencyToGlobal.affectedRows === 0) {
            return res.status(409).json({
                error: true,
                message: `Không thể sao chép lô hàng có mã ${req.body.shipment_id} thuộc bưu cục có mã ${req.user.agency_id} từ cơ sở dữ liệu bưu cục sang cơ sở dữ liệu tổng cục.`,
            });
        }

        const resultUpdatingParentForGlobalOrders = await shipmentService.updateParentForGlobalOrders(JSON.parse(shipment.order_ids), shipment.shipment_id);   

        return res.status(201).json({
            error: false,
            info: resultUpdatingParentForGlobalOrders,
            message: `Sao chép lô hàng có mã ${req.body.shipment_id} thuộc bưu cục có mã ${req.user.agency_id} từ cơ sở dữ liệu bưu cục sang cơ sở dữ liệu tổng cục thành công.`,
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getShipments = async (req, res) => {
    try {
        if(["AGENCY_MANAGER", "AGENCY_TELLER", "ADMIN"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);
            const { error } = shipmentRequestValidation.validateFindingShipment(req.body);
            
            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            const fields = "parent";
            const values = req.body.shipment_id;
            const result = await shipmentService.getShipmentForAgency(fields, values, postalCode);
            
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin lô hàng thành công!",
            });
        }
        else if(["MANAGER", "TELLER", "ADMIN"].includes(req.user.role)) {
            const { error } = shipmentRequestValidation.validateFindingShipment(req.body);
        
            if (error) {
                return res.status(400).json({
                    error: true,
                    message: "Thông tin không hợp lệ!",
                });
            }

            const fields = "parent";
            const values = req.body.shipment_id;
            const result = await shipmentService.getShipmentForAdmin(fields, values);
            
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin lô hàng thành công!",
            });
        }
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}


const getShipmentForAdmin = async (req, res) => {
    try {
        if(["MANAGER", "TELLER", "ADMIN"].includes(req.user.role)) {
            const { error } = shipmentRequestValidation.validateFindingShipment(req.body);
        
            if (error) {
                return res.status(400).json({
                    error: true,
                    message: "Thông tin không hợp lệ!",
                });
            }

            const fields = "parent";
            const values = req.body.shipment_id;
            const result = await shipmentService.getShipmentForAdmin(fields, values);
            
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin lô hàng thành công!",
            });
        }
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const deleteShipment = async (req, res) => {
    try {
        const { error } = shipmentRequestValidation.validateShipmentID(req.body);
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        if(["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);

            const shipmentID = req.body.shipment_id;
            const result = await shipmentService.deleteShipment(shipmentID, postalCode);

            if (!result || result[0].affetedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment} không tồn tại trong bưu cục có mã ${agency_id}.`,
                });
            }
            return res.status(200).json({
                error: false,
                data: result,
            });
        }
        else if (["ADMIN", "MANAGER", "TELLER"].includes(req.user.role)) {
            const shipmentID = req.body.shipment_id;
            const result = await shipmentService.deleteShipment(shipmentID, postalCode);

            if (!result || result[0].affetedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment} không tồn tại trong bưu cục có mã ${agency_id}.`,
                });
            }

            return res.status(200).json({
                error: false,
                data: result,
            });
        }
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const decomposeShipment = async (req, res) => {
    try {
        if(["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            // const agency_id = "TD_78300_00000";
            // const postalCode = utils.getPostalCodeFromAgencyID(agency_id);
        
            const { error } = shipmentRequestValidation.validateDecomposingShipment(req.body);

            if (error) {
                return res.status(400).json({
                    error: true,
                    //message: "Thông tin không hợp lệ!",
                    message: error.message,
                });
            }

            const shipmentID = req.body.shipment_id;
            const order_ids = req.body.order_ids;

            const result = await shipmentService.decomposeShipment(shipmentID, order_ids, agency_id);

            if (!result || result[0].affetedRows <= 0) {
                return res.status(404).json({
                    error: true,
                    message: "Lô hàng không tồn tại.",
                });
            }

            return res.status(200).json({
                error: false,
                data: result,
                message: "Rã lô hàng thành công!",
            });
        }
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}


const recieveShipment = async (req, res) => {
    try {
        if(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            // const agency_id = "TD_78300_00000";
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);
            const { error } = shipmentRequestValidation.validateShipmentID(req.body);
            if(error) {
                return res.status(400).json({
                    error: true,
                    message: "Thông tin không hợp lệ!",
                });
            }

            const shipmentID = req.body.shipment_id;
            const result = await shipmentService.recieveShipment(shipmentID, postalCode);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Nhập lô hàng thành công!",
            });
        }
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

// status_code cho orders, shipper cho orders, shipment_ids cho vehicle

const undertakeShipment = async (req, res) => {
    try {
        if(["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"].includes(req.user.role)) {
            const { error } = shipmentRequestValidation.validateUndertakeShipment(req.body);
            if(error) {
                console.log(error.message);
                throw new Error(error.message);
            }

            const checkExistShipment = await shipmentService.checkExistShipment(req.body.shipment_id, req.user.agency_id);
            if(!checkExistShipment.existed) {
                return res.status(404).json({
                    error: true,
                    message: checkExistShipment.message
                });
            }

            const result = await shipmentService.undertakeShipment(req.body.shipment_id, req.user.staff_id, req.user.agency_id, req.body.status_code);
            if(!result.success) {
                return res.status(404).json({
                    error: true,
                    message: result.message
                })
            }
            return res.status(200).json({
                error: false,
                data: result.data,
                message: result.message
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        })
    }
}

module.exports = {
    createNewShipment,
    updateShipment,
    getShipments,
    getShipmentForAdmin,
    recieveShipment,
    addOrderToShipment,
    deleteOrderFromShipment,
    confirmCreateShipment,
    deleteShipment,
    decomposeShipment,
    undertakeShipment,
};