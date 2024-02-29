const moment = require("moment");
const shipmentService = require("../services/shipmentsService");
const validation = require("../lib/validation");
const utils = require("../lib/utils");
const servicesStatus = require("../lib/servicesStatus");
const shipmentRequestValidation = new validation.ShipmentValidation();


const createNewShipment = async (req, res) => {
    try {
        const createdTime = new Date();
        if(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"].includes(req.user.role)) {
            const { error } = shipmentRequestValidation.validateCreatingShipment(req.body);
    
            if (error) {
                return res.status(400).json({
                    error: true,
                    message: "Thông tin không hợp lệ!",
                });
            }
            const agency = req.user.agency_id;
            console.log(agency);
            const areaAgencyIdSubParts = agency.split('_');
            req.body.shipment_id = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + createdTime.getFullYear().toString() + createdTime.getMonth().toString() + createdTime.getDate().toString() + createdTime.getHours().toString() + createdTime.getMinutes().toString() + createdTime.getSeconds().toString() + createdTime.getMilliseconds().toString();
            const result = await shipmentService.createNewShipment(req.body, agency);
            if(result.success) {
                return res.status(200).json({
                    error: false,
                    message: result.message,
                });
            }
            else {
                return res.status(400).json({
                    error: true,
                    message: result.message
                });
            }
            
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
        if(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);

        
            const { error } = shipmentRequestValidation.validateUpdatingShipment(req.body);

            if (error) {
                return res.status(400).json({
                    error: true,
                    message: "Thông tin không hợp lệ!",
                });
            }

            const fields = "mass";
            const values = req.body.mass;

            const conditionFields = "shipment_id";
            const conditionValues = req.body.shipment_id;

            const result = await shipmentService.updateShipment(fields, values, conditionFields, conditionValues, postalCode);
            
            if (!result || result.affectedRows <= 0) {
                return res.status(404).json({
                    error: true,
                    message: "Lô hàng không tồn tại.",
                });
            }

            return res.status(201).json({
                error: false,
                message: "Cập nhật lô hàng thành công!",
            });
        }
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const addOrderToShipment = async (req, res) => {
    try {
        if(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            //const agency_id = "TD_78300_00000";
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);
      
            const { error } = shipmentRequestValidation.validateOperationWithOrder(req.body);

            if(error) {
                return res.status(400).json({
                    error: true,
                    message: "Thông tin không hợp lệ!",
                });
            }

            const shipmentID = req.body.shipment_id;
            const orderID = req.body.order_id;
            const result = await shipmentService.addOrderToShipment(shipmentID, orderID, postalCode);
            if(!result.success) {
                return res.status(404).json({
                    error: true,
                    message: result.message,
                })
            }
            return res.status(200).json({
                error: false,
                data: result.data,
                message: result.message,
            });
        
        }
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const deleteOrderFromShipment = async (req, res) => {
    try {
        if(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            // const agency_id = "TD_78300_00000";
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);
            const { error } = shipmentRequestValidation.validateOperationWithOrder(req.body);

            if(error) {
                return res.status(400).json({
                    error: true,
                    message: "Thông tin không hợp lệ!",
                });
            }

            const shipmentID = req.body.shipment_id;
            const orderID = req.body.order_id;
            const result = await shipmentService.deleteOrderFromShipment(shipmentID, orderID, postalCode);

            if(!result.success) {
                return res.status(404).json({
                    error: true,
                    message: result.message,
                })
            }
            return res.status(200).json({
                error: false,
                data: result.data,
                message: result.message,
            });
        }
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const confirmCreateShipment = async (req, res) => {
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

            const data = await shipmentService.getInfoShipment(req.body.shipment_id, postalCode);
            const result = await shipmentService.confirmCreateShipment(data.fields, data.values);

            // Nếu tìm thấy một đơn hàng tồn tại trong bucket nhưng không tồn tại trong global orders hoặc agency orders
            // thì tự động xóa lô hàng đó trong agency và cả global
            try {
                await shipmentService.updateParentForGlobalOrders(req.body.shipment_id, postalCode);   
            } catch (error) {
                await shipmentService.deleteShipment(req.body.shipment_id, postalCode);
                await shipmentService.deleteGlobalShipment(req.body.shipment_id);
                return res.status(404).json({
                    error: true,
                    message: error.message,
                    notification: "Lỗi không tìm thấy đơn hàng trên tổng cục, đã xóa lô hàng!"
                });
            }

            return res.status(200).json({
                error: false,
                message: "Tạo lô hàng trên tổng cục thành công.",
            });
        }
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getShipmentForAgency = async (req, res) => {
    try {
        if(["AGENCY_MANAGER", "AGENCY_TELLER", "ADMIN"].includes(req.user.role)) {
            // const agency_id = "TD_78300_00000";
            const agency_id = req.user.agency_id;
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);
            const { error } = shipmentRequestValidation.validateFindingShipment(req.body);
            
            if (error) {
                return res.status(400).json({
                    error: true,
                    message: "Thông tin không hợp lệ!",
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
            const result = await shipmentService.deleteShipment(shipmentID, postalCode);

            if (!result || result[0].affetedRows <= 0) {
                return res.status(404).json({
                    error: true,
                    message: "Lô hàng không tồn tại.",
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

const updateShipmentToDatabase = async (req, res) => {
    try {
        if(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"].includes(req.user.role)) {
            const agency_id = req.user.agency_id;
            // const agency_id = "TD_78300_00000";
            const postalCode = utils.getPostalCodeFromAgencyID(agency_id);
            const { error } = shipmentRequestValidation.validateShipmentID(req.body);
            if (error) {
                return res.status(400).json({
                    error: true,
                    message: "Thông tin không hợp lệ!",
                });
            }

            const shipmentID = req.body.shipment_id;
            const data = await shipmentService.getInfoShipment(shipmentID, postalCode);
            const result = await shipmentService.updateShipmentToDatabase(data.fields, data.values, shipmentID);

            if (!result || result.affectedRows <= 0) {
                return res.status(404).json({
                    error: true,
                    message: "Lô hàng không tồn tại.",
                });
            }

            return res.status(200).json({
                error: false,
                message: result,
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
        if(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"].includes(req.user.role)) {
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
    getShipmentForAgency,
    getShipmentForAdmin,
    recieveShipment,
    addOrderToShipment,
    deleteOrderFromShipment,
    confirmCreateShipment,
    deleteShipment,
    updateShipmentToDatabase,
    decomposeShipment,
    undertakeShipment,
};