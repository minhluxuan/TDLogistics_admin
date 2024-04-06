const moment = require("moment");
const shipmentService = require("../services/shipmentsService");
const validation = require("../lib/validation");
const utils = require("../lib/utils");
const transportPartnerService = require("../services/transportPartnerService");
const shippersService = require("../services/shippersService");
const servicesStatus = require("../lib/servicesStatus");
const shipmentRequestValidation = new validation.ShipmentValidation();
const agencyService = require("../services/agenciesService");

const checkExistShipment = async (req, res) => {
    try {
        const { error } = shipmentRequestValidation.validateShipmentID(req.query);
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const existed = await shipmentService.checkExistShipment(req.query);
        return res.status(200).json({
            error: false,
            existed: existed,
            message: existed ? `Lô hàng có mã ${req.query.shipment_id} đã tồn tại.` : `Lô hàng có mã ${req.query.shipment_id} không tồn tại.`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getAgenciesForShipment = async (req, res) => {
    try {
        const resultGettingManyAgencies = await shipmentService.getAgenciesForShipment();
        return res.status(200).json({
            error: false,
            data: resultGettingManyAgencies,
            message: "Lấy các bưu cục/đại lý sẵn sàng thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const createNewShipment = async (req, res) => {
    try {
        const createdTime = new Date();
        const formattedTime = moment(createdTime).format("DD-MM-YYYY HH:mm:ss")
        const { error } = shipmentRequestValidation.validateCreatingShipment(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (req.body.hasOwnProperty("agency_id_dest")) {
            const agency_destination = await agencyService.getOneAgency({ agency_id: req.body.agency_id_destination });
            if(!agency_destination || agency_destination.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Bưu cục có mã ${req.body.agency_id_dest} không tồn tại.`,
                });
            }

            req.body.agency_id_dest = agency_destination[0].agency_id;
            req.body.lat_destination = agency_destination[0].latitude;
            req.body.long_destination = agency_destination[0].longitude;
            delete req.body.agency_destination;
        }

        const agency_source = await agencyService.getOneAgency({ agency_id: req.user.agency_id });
        if(!agency_source || agency_source.length === 0) {
            return res.status(404).json({
                error: true,
                message: "Không tìm thấy Bưu cục phát."
            });
        }
        const areaAgencyIdSubParts = req.user.agency_id.split('_');
        req.body.shipment_id = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + createdTime.getFullYear().toString() + createdTime.getMonth().toString() + createdTime.getDate().toString() + createdTime.getHours().toString() + createdTime.getMinutes().toString() + createdTime.getSeconds().toString() + createdTime.getMilliseconds().toString();
        req.body.agency_id = req.user.agency_id;
        req.body.lat_source = agency_source[0].latitude;
        req.body.long_source = agency_source[0].longitude;

        if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);
            const journeyInfo = {
                time: formattedTime,
                message: `Lô hàng được tạo tại Bưu cục/Đại lý ${req.user.agency_id} bởi nhân viên ${req.user.staff_id}.`
            }
            req.body.status = 0;

            const resultCreatingShipmentForAgency = await shipmentService.createNewShipment(req.body, journeyInfo, postalCode);
            
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
        else if (["ADMIN", "MANAGER", "TELLER"].includes(req.user.role)) {
            const journeyInfo = {
                time: formattedTime,
                message: `Lô hàng được tạo tại Bưu cục/Đại lý ${req.user.agency_id} bởi nhân viên ${req.user.staff_id}.`
            }
            req.body.status = 2;
            const resultCreatingShipment = await shipmentService.createNewShipment(req.body, journeyInfo);
            
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

            let order_ids;
            try {
                order_ids = resultGettingOneShipment[0].order_ids ? JSON.parse(resultGettingOneShipment[0].order_ids) : new Array();
            } catch (error) {
                return res.status(200).json({
                    error: false,
                    data: new Array(),
                    message: `Lấy thông tin tất cả đơn hàng từ lô hàng có mã ${req.query.shipment_id} thành công.`,
                });
            }
            console.log(order_ids);
            const result = await shipmentService.getOrdersFromShipment(order_ids);
            
            return res.status(201).json({
                error: false,
                data: result,
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
        const decomposeTime = new Date();
        const formattedTime = moment(decomposeTime).format("DD-MM-YYYY HH:mm:ss")
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

        if (shipment.status === 6) {
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

        const journeyMessage = `${formattedTime}: Lô hàng được phân rã tại Bưu cục/Đại lý ${req.user.agency_id} bởi nhân viên ${req.user.staff_id}.`
        await shipmentService.updateJourney( req.query.shipment_id , formattedTime, journeyMessage);
        
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
        const receiveTime = new Date();
        const formattedTime = moment(receiveTime).format("DD-MM-YYYY HH:mm:ss")

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

        let resultCloneShipmentFromGlobalToAgency = null;
        if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);
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

            resultCloneShipmentFromGlobalToAgency = await shipmentService.cloneOrdersFromGlobalToAgency(JSON.parse(resultGettingOneShipment[0].order_ids), postalCode);
        }
        
        const journeyMessage = `${formattedTime}: Lô hàng được tiếp nhận tại Bưu cục/Đại lý ${req.user.agency_id} bởi nhân viên ${req.user.staff_id}.`
        await shipmentService.updateJourney( req.body.shipment_id , formattedTime, journeyMessage);
        const current_agency = await agencyService.getOneAgency({ agency_id: req.user.agency_id });
        if (!current_agency || current_agency.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Bưu cục mã ${req.user.agency_id} không tồn tại.`,
            });
        }

        const trackingShipment = {
            status: 5,
            parent: null,
            current_agency_id: current_agency[0].agency_id,
            current_lat: current_agency[0].latitude,
            current_long: current_agency[0].longitude
        }
        
        await shipmentService.updateShipment(trackingShipment, { shipment_id: req.body.shipment_id });
        if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);
            await shipmentService.updateShipment(trackingShipment, { shipment_id: req.body.shipment_id }, postalCode);
        }

        return res.status(200).json({
            error: false,
            info: resultCloneShipmentFromGlobalToAgency,
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
        const undertakeTime = new Date();
        const formattedTime = moment(undertakeTime).format("DD-MM-YYYY HH:mm:ss")
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

        const journeyMessage = `${formattedTime}: Lô hàng được yêu cầu giao/nhận bởi Bưu cục/Đại lý ${req.user.agency_id} cho nhân viên ${req.user.staff_id}.`
        await shipmentService.updateJourney( req.body.shipment_id , formattedTime, journeyMessage);
        
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

const updateJourney = async (req, res) => {
    try {
        const createdTime = new Date();
        const formattedTime = moment(createdTime).format("DD-MM-YYYY HH:mm:ss")
        const { conditionError } = shipmentRequestValidation.validateShipmentID(req.query);
        if(conditionError) {
            return res.status(400).json({
                error: true,
                message: conditionError.message,
            });
        }

        const updateResult = await shipmentService.updateJourney(req.query.shipment_id, formattedTime, req.body.message);
        if(!updateResult.success) {
            return res.status(404).json({
                error: true,
                message: updateResult.message
            });
        }
        return res.status(200).json({
            error: false,
            message: updateResult.message
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getJourney = async (req, res) => {
    try {
        const { conditionError } = shipmentRequestValidation.validateShipmentID(req.query);
        if(conditionError) {
            return res.status(400).json({
                error: true,
                message: conditionError.message,
            });
        }

        const shipment = await shipmentService.getOneShipment({ shipment_id: req.query.shipment_id });
        if(!shipment || shipment.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Lô hàng có mã ${req.query.shipment_id} không tồn tại.`,
            });
        }

        const journey = JSON.parse(shipment[0].journey);
        return res.status(200).json({
            error: false,
            data: journey,
            message: `Lấy hành trình lô hàng thành công!`,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const approveNewShipment = async (req, res) => {
    try {
        const { error } = shipmentRequestValidation.validateShipmentID(req.query);
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

        await shipmentService.updateShipment({ status: 2 }, req.query);
        await shipmentService.updateShipment({ status: 2}, req.query, utils.getPostalCodeFromAgencyID(resultGettingOneShipment[0].agency_id));

        return res.status(201).json({
            error: false,
            message: `Tiếp nhận lô hàng có mã ${req.query.shipment_id} thành công.`,
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
    checkExistShipment,
    getAgenciesForShipment,
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
    updateJourney,
    getJourney,
    approveNewShipment,
};