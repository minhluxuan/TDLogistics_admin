const moment = require("moment");
const shipmentService = require("../services/shipmentsService");
const utils = require("./utils");
const servicesUtils = require("../services/utils");

const shipmentRequestValidation = new utils.ShipmentValidation();

const createNewShipment = async (req, res) => {
    // if(!req.isAuthenticated() || req.user.permisson !== 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }

    //const agency_id = req.user.agency_id;
    const agency_id = "7400";

    try {
        const { error } = shipmentRequestValidation.validateCreatingShipment(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        let keys, values;

        const createdTime = new Date();
        const formattedCreatedTime = moment(createdTime).format("YYYY-MM-DD HH:mm:ss");

        const shipmentId = "TD" + createdTime.getFullYear().toString() + createdTime.getMonth().toString() + createdTime.getDay().toString() + createdTime.getHours().toString() + createdTime.getMinutes().toString() + createdTime.getSeconds().toString() + createdTime.getMilliseconds().toString();

        //get address throught coordinate
        const map = new servicesUtils.Map();

        const source = {
            lat: req.body.lat_source,
            long: req.body.long_source,
        };

        const destination = {
            lat: req.body.lat_destination,
            long: req.body.long_destination,
        };

        const addressSource = await map.convertCoordinateToAddress(source);
        const addressDestination = await map.convertCoordinateToAddress(destination);

        //luôn luôn để shipment_id là phần tử đầu tiên để xóa shipment thuận tiện
        req.body.shipment_id = shipmentId;
        req.body.address_source = addressSource;
        req.body.address_destination = addressDestination;

        if (req.body.hasOwnProperty("transport_partner_id")) {
            const data = await shipmentService.getDataForShipmentCode(req.body.staff_id, req.body.transport_partner_id);
            const partnerName = await utils.shortenName(data.partnerName);
            const vehicleID = data.vehicleID;
            const shipmentCode = "TD" + "-" + partnerName + "-" + createdTime.getFullYear().toString() + createdTime.getMonth().toString() + createdTime.getDay().toString() + "-" + req.body.route + "-" + vehicleID;
            
            if (req.body.hasOwnProperty("route")) {
                delete req.body.route;
            }

            req.body.shipment_code = shipmentCode;
            req.body.vehicle_code = vehicleID;

            keys = Object.keys(req.body);
            values = Object.values(req.body);
        }
        else {
            const data = await shipmentService.getDataForShipmentCode(req.body.staff_id);
            const shipperName = await utils.shortenName(data.fullname);
            const vehicleID = data.vehicleID ;
            const shipmentCode = "TD" + "-" + shipperName + "-" + createdTime.getFullYear().toString() + createdTime.getMonth().toString() + createdTime.getDay().toString() + "-" + req.body.route + "-" + vehicleID;

            if (req.body.hasOwnProperty("route")) {
                delete req.body.route;
            }

            req.body.shipment_code = shipmentCode;
            req.body.vehicle_code = vehicleID;

            keys = Object.keys(req.body);
            values = Object.values(req.body);
        }

        await shipmentService.createNewShipment(keys, values, agency_id);

        return res.status(200).json({
            error: false,
            message: "Tạo lô hàng thành công!",
        });
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
}

const updateShipment = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission !== 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    // const agency_id = req.user.agency_id;
    const agency_id = "7400";

    try {
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

        const result = await shipmentService.updateShipment(fields, values, conditionFields, conditionValues, agency_id);
        
        if (!result || result[0].affectedRows <= 0) {
            return res.status(404).json({
                error: true,
                message: "Lô hàng không tồn tại.",
            });
        }

        return res.status(201).json({
            error: false,
            message: "Cập nhật lô hàng thành công!",
        });
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
}

const getShipmentForAgency = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission !== 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    // const agency_id = req.user.agency_id;
    const agency_id = "7400";
    
    try {
        const { error } = shipmentRequestValidation.validateFindingShipment(req.body);
        
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        const fields = "parent";
        const values = req.body.shipment_id;
        const result = await shipmentService.getShipmentForAgency(fields, values, agency_id);
        
        return res.status(200).json({
            error: false,
            data: result,
            message: "Lấy thông tin lô hàng thành công!",
        });

    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
}

const getShipmentForAdmin = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission !== 4) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    
    try {
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

    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const confirmCreateShipment = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission < 4) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    // const agency_id = req.session.agency_id;
    const agency_id = "7400";

    try {
        const { error } = shipmentRequestValidation.validateShipmentID(req.body);
        
        if(error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        const data = await shipmentService.getInfoShipment(req.body.shipment_id, agency_id);

        const result = await shipmentService.confirmCreateShipment(data.fields, data.values);

        // Nếu tìm thấy một đơn hàng tồn tại trong bucket nhưng không tồn tại trong global orders hoặc agency orders
        // thì tự động xóa lô hàng đó trong agency và cả global
        try {
            await shipmentService.updateParentForGlobalOrders(req.body.shipment_id, agency_id);   
        } catch (error) {
            await shipmentService.deleteShipment(req.body.shipment_id, agency_id);
            await shipmentService.deleteGlobalShipment(req.body.shipment_id);
        }

        return res.status(200).json({
            error: false,
            message: "Tạo lô hàng trên tổng cục thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const updateShipmentToDatabase = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission < 4) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    // const agency_id = req.session.agency_id;
    const agency_id = "7400";

    try {
        const { error } = shipmentRequestValidation.validateShipmentID(req.body);
        
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        const shipmentID = req.body.shipment_id;
        const data = await shipmentService.getInfoShipment(shipmentID, agency_id);
        const result = await shipmentService.updateShipmentToDatabase(data.fields, data.values, shipmentID);

        if (!result || result[0].affetedRows <= 0) {
            return res.status(404).json({
                error: true,
                message: "Lô hàng không tồn tại.",
            });
        }

        return res.status(200).json({
            error: false,
            message: result,
        });

    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const deleteShipment = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission < 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    // const agency_id = req.session.agency_id;
    const agency_id = "7400";

    try {
        const { error } = shipmentRequestValidation.validateShipmentID(req.body);

        if(error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        const shipmentID = req.body.shipment_id;
        const result = await shipmentService.deleteShipment(shipmentID, agency_id);

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
    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const decomposeShipment = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission !== 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    // const agency_id = req.session.agency_id;
    const agency_id = "7400";
    
    try {
        const { error } = shipmentRequestValidation.validateDecomposingShipment(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
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

    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
    
}

module.exports = {
    createNewShipment,
    updateShipment,
    getShipmentForAgency,
    getShipmentForAdmin,
    confirmCreateShipment,
    deleteShipment,
    updateShipmentToDatabase,
    decomposeShipment,
};