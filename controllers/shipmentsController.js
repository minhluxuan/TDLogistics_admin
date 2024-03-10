const moment = require("moment");
const shipmentService = require("../services/shipmentsService");
const validation = require("../lib/validation");
const utils = require("../lib/utils");
const transportPartnerService = require("../services/transportPartnerService");
const shippersService = require("../services/shippersService");
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
        req.body.agency_id_source = req.user.agency_id;

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
                error: false,
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
                error: false,
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

const getOrdersFromShipment = async (req, res) => {
    try {
        const { error } = shipmentRequestValidation.validateQueryUpdatingShipment(req.query);

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

            let order_ids;
            try {
                order_ids = resultGettingOneShipmentInAgency[0].order_ids ? JSON.parse(resultGettingOneShipmentInAgency[0].order_ids) : new Array();
            } catch (error) {
                return res.status(200).json({
                    error: false,
                    data: new Array(),
                    message: `Lấy thông tin tất cả đơn hàng từ lô hàng có mã ${req.query.shipment_id} thành công.`,
                });
            }

            const result = await shipmentService.getOrdersFromShipment(order_ids);
            
            return res.status(200).json({
                error: false,
                data: result,
                message: `Lấy thông tin tất cả đơn hàng từ lô hàng có mã ${req.query.shipment_id} thành công.`,
            });
        }
        else if (["ADMIN", "MANAGER", "TELLER"].includes(req.user.role)) {
            const resultGettingOneShipment = await shipmentService.getOneShipment(req.query);
            if (!resultGettingOneShipment || resultGettingOneShipment.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment_id} không tồn tại.`,
                });
            }

            const result = await shipmentService.getOrdersFromShipment(resultGettingOneShipment[0]);
            
            return res.status(201).json({
                error: false,
                info: result,
                message: `Lấy thông tin tất cả đơn hàng từ lô hàng có mã ${req.query.shipment_id} thành công.`,
            });
        }
    } catch (error) {
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

            const resultGettingOneShipment = await shipmentService.getOneShipment(req.query);
            if (!resultGettingOneShipment || resultGettingOneShipment.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment_id} không tồn tại trong bưu cục có mã ${agency_id}.`,
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
        const paginationConditions = { rows: 0, page: 0 };

        if (req.query.rows) {
            paginationConditions.rows = parseInt(req.query.rows);
        }

        if (req.query.page) {
            paginationConditions.page = parseInt(req.query.page);
        }

        const { error: paginationError } = shipmentRequestValidation.validatePaginationConditions(paginationConditions);
        if (paginationError) {
            return res.status(400).json({
                error: true,
                message: paginationError.message,
            });
        }
        if(["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);
            const { error } = shipmentRequestValidation.validateFindingShipment(req.body);
            
            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            const result = await shipmentService.getShipments(req.body, paginationConditions, postalCode);
            
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
                    message: error.message,
                });
            }

            const result = await shipmentService.getShipments(req.body, paginationConditions);
            
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
        const { error } = shipmentRequestValidation.validateShipmentID(req.query);
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);

            const resultDeletingShipment = await shipmentService.deleteShipment(req.query.shipment_id, postalCode);

            if (!resultDeletingShipment || resultDeletingShipment.affetedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment} không tồn tại trong bưu cục có mã ${req.user.agency_id}.`,
                });
            }

            return res.status(200).json({
                error: false,
                message: `Xóa lô hàng có mã ${req.query.shipment_id} thuộc bưu cục có mã ${req.user.agency_id} thành công.`,
            });
        }
        else if (["ADMIN", "MANAGER", "TELLER"].includes(req.user.role)) {
            const resultDeletingShipment = await shipmentService.deleteShipment(req.query.shipment_id);

            if (!resultDeletingShipment || resultDeletingShipment.affetedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment} không tồn tại.`,
                });
            }

            return res.status(200).json({
                error: false,
                message: `Xóa lô hàng có mã ${req.query.shipment_id} thành công.`,
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
        const { error } = shipmentRequestValidation.validateShipmentID(req.query) && shipmentRequestValidation.validateDecomposingShipment(req.body);

        if (error) {
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

        const shipment = resultGettingOneShipment[0];

        if (shipment.status === 1) {
            return res.status(409).json({
                error: true,
                message: `Lô hàng có mã ${req.query.shipment_id} đã được rã từ trước.`,
            });
        }

        try {
            if (!shipment.order_ids || JSON.parse(shipment.order_ids).length === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${req.query.shipment_id} không tồn tại đơn hàng nào để có thể rã lô.`
                });
            }
        } catch (error) {
            return res.status(404).json({
                error: true,
                message: `Lô hàng có mã ${req.query.shipment_id} không tồn tại đơn hàng nào để có thể rã lô.`
            });
        }

        const resultComparingOrdersInRequestWithOrdersInShipment = await shipmentService.compareOrdersInRequestWithOrdersInShipment(req.body.order_ids, JSON.parse(shipment.order_ids));
        const hitNumber = resultComparingOrdersInRequestWithOrdersInShipment.hitNumber;
        const hitArray = resultComparingOrdersInRequestWithOrdersInShipment.hitArray;
        const missNumber = resultComparingOrdersInRequestWithOrdersInShipment.missNumber;
        const missArray = resultComparingOrdersInRequestWithOrdersInShipment.missArray;

        const resultDecomposingShipment = await shipmentService.decomposeShipment(JSON.parse(shipment.order_ids), shipment.shipment_id, req.user.agency_id);

        const updatedNumber = resultDecomposingShipment.updatedNumber;
        const updatedArray = resultDecomposingShipment.updatedArray;

        return res.status(201).json({
            error: false,
            info: {
                hitNumber,
                hitArray,
                missNumber,
                missArray,
                updatedNumber,
                updatedArray,
            },
            message: "Rã lô hàng thành công!",
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const receiveShipment = async (req, res) => {
    try {
        const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);
        const { error } = shipmentRequestValidation.validateShipmentID(req.body);
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultGettingOneShipment = await shipmentService.getOneShipment(req.body);
        if (!resultGettingOneShipment || resultGettingOneShipment.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Lô hàng có mã ${req.body.shipment_id} không tồn tại.`,
            });
        }

        if (await shipmentService.checkExistShipment({ shipment_id: req.body.shipment_id }, postalCode)) {
            return res.status(409).json({
                error: true,
                message: `Lô hàng có mã ${req.body.shipment_id} đã tồn tại trong bưu cục có mã ${req.user.agency_id}.`,
            });
        }

        const resultPastingShipmentToAgency = await shipmentService.pasteShipmentToAgency(resultGettingOneShipment[0], postalCode);
        if (!resultPastingShipmentToAgency || resultPastingShipmentToAgency.affectedRows === 0) {
            return res.status(409).json({
                error: true,
                message: `Sao chép lô hàng có mã ${req.body.shipment_id} từ cơ sở dữ liệu tổng cục sang cơ sở dữ liệu bưu cục thất bại.`
            });
        }

        if (!resultGettingOneShipment[0].order_ids) {
            return res.status(201).json({
                error: true,
                message: `Tiếp nhận lô hàng có mã ${req.body.shipment_id} thành công.`,
            });
        }

        const resultCloningOrdersFromGlobalToAgency = await shipmentService.cloneOrdersFromGlobalToAgency(JSON.parse(resultGettingOneShipment[0].order_ids), postalCode);
        
        return res.status(200).json({
            error: false,
            info: resultCloningOrdersFromGlobalToAgency,
            message: `Tiếp nhận lô hàng có mã ${req.body.shipment_id} thành công.`,
        });
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const undertakeShipment = async (req, res) => {
    try {
        const { error } = shipmentRequestValidation.validateUndertakeShipment(req.body);
        if(error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultGettingOneShipment = await shipmentService.getOneShipment({ shipment_id: req.body.shipment_id });
        if (!resultGettingOneShipment || resultGettingOneShipment.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Lô hàng có mã ${req.body.shipment_id} không tồn tại.`,
            });
        }

        const resultAddingOneShipmentToVehicle = await shipmentService.addOneShipmentToVehicle(req.body.shipment_id, req.user.staff_id);
        if (!resultAddingOneShipmentToVehicle || resultAddingOneShipmentToVehicle.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Nhân viên có mã ${req.user.staff_id} không có phương tiện nào để có thể tiếp nhận lô hàng này.`,
            });
        }

        const shipment = resultGettingOneShipment[0];
        try {
            if (!shipment.order_ids || JSON.parse(shipment.order_ids).length === 0) {
                return res.status(201).json({
                    error: true,
                    message: `Nhân viên có mã ${req.user.staff_id} tiếp nhận lô hàng có mã ${req.body.shipment_id} thành công.`,
                });
            }
        } catch (error) {
            return res.status(201).json({
                error: true,
                message: `Nhân viên có mã ${req.user.staff_id} tiếp nhận lô hàng có mã ${req.body.shipment_id} thành công.`,
            });
        }

        const orderIdsArray = JSON.parse(shipment.order_ids);
        const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);
        const resultUpdatingOrders = await shipmentService.updateOrders(orderIdsArray, req.user.staff_id, postalCode);

        const successUpdatedParentNumber = resultUpdatingOrders.acceptedNumber;
        const successUpdatedParentArray = resultUpdatingOrders.acceptedArray;
        const faildUpdatedParentNumber = resultUpdatingOrders.notAcceptedNumber;
        const faildUpdatedParentArray = resultUpdatingOrders.notAcceptedArray;

        const resultAssignNewTaskForShipper = await shippersService.assignNewTasks(orderIdsArray, req.user.staff_id, postalCode);
        
        const successAssignedTasksNumber = resultAssignNewTaskForShipper.acceptedNumber;
        const successAssignedTasksArray = resultAssignNewTaskForShipper.acceptedArray;
        const failAssignedTasksNumber = resultAssignNewTaskForShipper.notAcceptedNumber;
        const failAssignedTasksArray = resultAssignNewTaskForShipper.notAcceptedArray;

        return res.status(201).json({
            error: false,
            data: {
                successUpdatedParentNumber,
                successUpdatedParentArray,
                faildUpdatedParentNumber,
                faildUpdatedParentArray,
                successAssignedTasksNumber,
                successAssignedTasksArray,
                failAssignedTasksNumber,
                failAssignedTasksArray,
            },
            message: `Lô hàng có mã ${req.body.shipment_id} đã được tiếp nhận bởi nhân viên có mã ${req.user.staff_id}.`
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
    createNewShipment,
    updateShipment,
    getShipments,
    receiveShipment,
    getOrdersFromShipment,
    addOrderToShipment,
    deleteOrderFromShipment,
    confirmCreateShipment,
    deleteShipment,
    decomposeShipment,
    undertakeShipment,
};