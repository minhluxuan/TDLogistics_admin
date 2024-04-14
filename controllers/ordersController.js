const ordersService = require("../services/ordersService");
const Validation = require("../lib/validation");
const servicesFee = require("../lib/serviceFeev2");
const libMap = require("../lib/map");
const utils = require("../lib/utils");
const eventManager = require("../lib/eventManager");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const servicesStatus = require("../lib/servicesStatus");
const shippersService = require("../services/shippersService");
const paymentService = require("../services/paymentService");
const randomstring = require("randomstring");

const orderValidation = new Validation.OrderValidation();

try {
    eventManager.once("ioInitialize", io => {
        io.sockets.on("connection", (socket) => {
            socket.on("notifyNewOrder", async (info) => {
                try {
                    const orderTime = new Date();
                    
                    if (info.service_type === "T60") {
                        if (info.length && info.width && info.height
                            && (info.length * info.width * info.height) / 6000 < 5) {
                                return socket.emit("notifyError", `Đơn hàng với kích thước ${info.length} x ${info.width} x ${info.height} không phù hợp với dịch vụ T60.
                                Yêu cầu: (chiều dài x chiều rộng x chiều cao)/6000 >= 5.`);
                            }
                    }

                    if (["USER"].includes(socket.request.user.role)) {
                        const { error } = orderValidation.validateCreatingOrder(info);
        
                        if (error) {
                            return socket.emit("notifyError", error.message);
                        }
                        
                        info.user_id = socket.request.user.user_id;
                        info.phone_number_sender = socket.request.user.phone_number;
                        // info.name_sender = socket.request.user.fullname;
                        info.status_code = servicesStatus.processing.code;
                    }
                    else if (["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"].includes(socket.request.user.role)) {
                        const { error } = orderValidation.validateCreatingOrderByAdmin(info);
        
                        if (error) {
                            return socket.emit("notifyError", error.message);
                        }
                        
                        info.status_code = servicesStatus.received.code;
                    }

                    if (info.service_type === "NNT") {
                        if(info.province_source !== info.province_dest) {
                            const errorMessage = "Đơn hàng phải được giao nội tỉnh!";
                            return socket.emit("notifyError", errorMessage);
                        }
                    }

                    await createNewOrder(socket, info, orderTime);
                } catch (error) {
                    return eventManager.emit("notifyError", error.message);
                }    
            });
        });
    });
} catch (error) {
    console.log(error);
    return eventManager.emit("notifyError", error.message);
}

const createNewOrder = async (socket, info, orderTime) => {
    try {
        const resultFindingManagedAgency = await ordersService.findingManagedAgency(info.ward_source, info.district_source, info.province_source);   
        
        info.journey = JSON.stringify(new Array());
        const agencies = resultFindingManagedAgency.agency_id;
        const areaAgencyIdSubParts = agencies.split('_');
        info.agency_id = agencies;
        const orderCode = orderTime.getFullYear().toString() + (orderTime.getMonth() + 1).toString() + orderTime.getDate().toString() + orderTime.getHours().toString() + orderTime.getMinutes().toString() + orderTime.getSeconds().toString() + orderTime.getMilliseconds().toString();
        info.order_id = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + orderCode;
        
        const provinceSource = info.province_source.replace(/^(Thành phố\s*|Tỉnh\s*)/i, '').trim();
        const provinceDest = info.province_dest.replace(/^(Thành phố\s*|Tỉnh\s*)/i, '').trim();

        const mass = (info.length * info.width * info.height) / 6000;

        info.fee = servicesFee.calculateFee(info.service_type, provinceSource, provinceDest, mass * 1000, 0.15, false);
        // info.order_code = orderCode;
        info.status_code = servicesStatus.processing.code; //Trạng thái đang được xử lí
        info.paid = false;

        const orderCodeRandom = randomstring.generate({
            length: 7,
            charset: "numeric",
            min: 1000000,
            max: 9999999,
        });

        info.order_code = orderCodeRandom;
        const resultCreatingNewPayment = await paymentService.createPaymentService(parseInt(orderCodeRandom), info.fee, `THANH TOAN DON HANG`);
        if (!resultCreatingNewPayment || !resultCreatingNewPayment.qrCode) {
            return socket.emit("notifyFailCreateNewOrder", "Lỗi khi tạo hóa đơn thanh toán. Vui lòng thử lại.");
        }

        const resultGettingPaymentLinkInfo = await paymentService.getPaymentInformation(orderCodeRandom);
        console.log(resultGettingPaymentLinkInfo);

        info.qrcode = resultCreatingNewPayment.qrCode;

        const resultCreatingNewOrder = await ordersService.createNewOrder(info);
        if (!resultCreatingNewOrder || resultCreatingNewOrder.length === 0) {
            return socket.emit("notifyFailCreatedNewOrder", "Tạo đơn hàng thất bại.");
        }

        const resultCreatingNewOrderInAgency = await ordersService.createOrderInAgencyTable(info, resultFindingManagedAgency.postal_code);
        if (!resultCreatingNewOrderInAgency || resultCreatingNewOrderInAgency.length === 0) {
            return socket.emit("notifyFailCreatedNewOrder", "Tạo đơn hàng thất bại.");
        }

        eventManager.emit("notifySuccessCreatedNewOrder", "Tạo đơn hàng thành công.");

        eventManager.emit("notifyNewOrderToAgency", {
            order: info,
            room: resultFindingManagedAgency.agency_id,
        });
    } catch (error) {
        console.log(error);
        return socket.emit("notifyError", error.message);
    }
}

const calculateServiceFee = async (req, res) => {
    try{
        if((["USER", "ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]).includes(req.user.role)) {
            const provinceSource = req.body.province_source.replace(/^(Thành phố\s*|Tỉnh\s*)/i, '').trim();
            const provinceDest = req.body.province_dest.replace(/^(Thành phố\s*|Tỉnh\s*)/i, '').trim();

            const mass = (req.body.length * req.body.width * req.body.height) / 6000;
            
            let optionService = null;
            if(req.body.service_type === "T60") {
                optionService = "T60";
                req.body.service_type = "CPN";
            }
            const fee = servicesFee.calculateFee(req.body.service_type, provinceSource, provinceDest, mass * 1000, 0.15, optionService, false);
            return res.status(200).json({
                error: false,
                data: fee,
                message: `Phí vận chuyển là ${fee} VND.`
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        }); 
    }
}

const checkExistOrder = async (req, res) => {
    try {
        const existed = await ordersService.checkExistOrder({ order_id: req.query.order_id });
        return res.status(200).json({
            error: false, 
            existed: existed,
            message: existed ? `Đơn hàng có mã ${req.query.order_id} đã tồn tại.` : `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getOrders = async (req, res) => {
    try {
        const paginationConditions = { rows: 0, page: 0 };

        if (req.query.rows) {
            paginationConditions.rows = parseInt(req.query.rows);
        }

        if (req.query.page) {
            paginationConditions.page = parseInt(req.query.page);
        }

        const { error: paginationError } = orderValidation.validatePaginationConditions(paginationConditions);
        if (paginationError) {
            return res.status(400).json({
                error: true,
                message: paginationError.message,
            });
        }

        const { error } = orderValidation.validateFindingOrders(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (["USER", "BUSINESS"].includes(req.user.role)) {
            req.body.user_id = req.user.user_id || req.user.business_id;

            const result = await ordersService.getOrders(req.body, paginationConditions);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin thành công!"
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_SHIPPER"].includes(req.user.role)) {
            const agencyIdSubParts = req.user.agency_id.split('_');
            
            const result = await ordersService.getOrdersOfAgency(agencyIdSubParts[1], req.body, paginationConditions);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin thành công!",
            });
        }

        const result = await ordersService.getOrders(req.body, paginationConditions);
        return res.status(200).json({
            error: false,
            data: result,
            message: "Lấy thông tin thành công!",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const checkFileFormat = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(404).json({
                error: true,
                message: "File không tồn tại.",
            });
        }

        const folderPath = path.join("storage", "business_user", "document", "orders_temp");
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        
        const filePath = path.join(folderPath, req.file.filename);
        if (!fs.existsSync(filePath)) {
            throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
        }

        const resultCheckingFileFormat = await ordersService.checkFileFormat(filePath.toString());

        fs.unlinkSync(filePath);

        return res.status(200).json({
            error: false,
            valid: resultCheckingFileFormat.valid,
            message: resultCheckingFileFormat.message,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const createOrdersByFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(404).json({
                error: true,
                message: "File không tồn tại.",
            });
        }

        const folderPath = path.join("storage", "business_user", "document", "orders_temp");
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        
        const filePath = path.join(folderPath, req.file.filename);
        if (!fs.existsSync(filePath)) {
            throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
        }

        const resultCheckingFileFormat = await ordersService.checkFileFormat(filePath.toString());
        if (!resultCheckingFileFormat.valid) {
            return res.status(400).json({
                error: true,
                message: resultCheckingFileFormat.message,
            });
        }

        const orders = await ordersService.getOrdersFromFile(filePath.toString());
        
        let successNumber = 0;
        const successArray = new Array();
        let failNumber = 0;
        const failArray = new Array();
        
        for (const order of orders) {
            const orderTime = new Date();
            
            const areaAgencyIdSubParts = req.user.agency_id.split('_');
            order.agency_id = req.user.agency_id;
            order.order_id = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + orderTime.getFullYear().toString() + (orderTime.getMonth() + 1).toString() + orderTime.getDate().toString() + orderTime.getHours().toString() + orderTime.getMinutes().toString() + orderTime.getSeconds().toString() + orderTime.getMilliseconds().toString();
            order.fee = servicesFee.calculateFee(order.service_type, order.province_source, order.province_dest, order.mass * 1000, 0.15, false);

            const stt = order.STT;
            delete order.STT;

            const resultCreatingNewOrder = await ordersService.createNewOrder(order);
            if (!resultCreatingNewOrder || resultCreatingNewOrder.affectedRows === 0) {
                failNumber++;
                failArray.push(stt);
            }
            else {
                successNumber++;
                successArray.push(stt);
            }
        }

        fs.unlinkSync(filePath);

        return res.status(201).json({
            error: false,
            info: new Object({
                successNumber,
                successArray,
                failNumber,
                failArray,
            }),
            message: `Tạo đơn hàng từ file ${req.file.filename} thành công.`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const updateOrder = async (req, res) => {
    try {
        const { error: error1 } = orderValidation.validateQueryUpdatingOrder(req.query);
        if (error1) {
            return res.status(400).json({
                error: true,
                message: error1.message,
            });
        }

        const { error: error2 } = orderValidation.validateUpdatingOrder(req.body);
        if (error2) {
            return res.status(400).json({
                error: true,
                message: error2.message,
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            req.query.agency_id = req.user.agency_id;
        }
        else if (["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"].includes(req.user.role)) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);
            if (!(await shippersService.checkExistTask({ order_id: req.query.order_id }, postalCode))) {
                return res.status(404).json({
                    error: true,
                    message: `Đơn hàng ${req.query.order_id} không tồn tại.`,
                });
            }
            req.query.agency_id = req.user.agency_id;
        }

        const result = await ordersService.updateOrder(req.body, req.query);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
            });
        }

        const resultGettingOneOrder = await ordersService.getOneOrder(req.query);
        if (!resultGettingOneOrder || resultGettingOneOrder.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã đơn hàng ${req.query.order_id} không tồn tại.`,
            });
        }

        const updatedRow = resultGettingOneOrder[0];

        const mass = (updatedRow.length * updatedRow.width * updatedRow.height) / 6000;
        
        updatedRow.fee = servicesFee.calculateFee(updatedRow.service_type, updatedRow.province_source, updatedRow.province_dest, mass * 1000, 0.15, false);
        
        const resultUpdatingOneOrder = await ordersService.updateOrder({ fee: updatedRow.fee }, req.query);
        if (!resultUpdatingOneOrder || resultUpdatingOneOrder.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã đơn hàng ${req.query.order_id} không tồn tại.`,
            });
        }

        return res.status(200).json({
            error: false,
            data: {
                fee: updatedRow.fee,
            },
            message: `Cập nhật đơn hàng có mã đơn hàng ${req.query.order_id} thành công.`,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { error } = OrderValidation.validateCancelingOrder(req.query);

        if (error) {
            return res.status(404).json({
                error: true,
                message: error.message,
            });
        }

        if (["USER"].includes(req.user.role)) {
            req.query.user_id = req.user.user_id;

            const resultDeletingOneOrder = await ordersService.cancelOrderWithTimeConstraint(req.query);
            if (!resultDeletingOneOrder || resultDeletingOneOrder.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Đơn hàng có mã đơn hàng ${req.query.order_id} không tồn tại hoặc quá hạn để hủy.`,
                });
            }
        }
        else if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            req.query.agency_id = req.user.agency_id;

            const resultDeletingOneOrder = await ordersService.cancelOrderWithTimeConstraint(req.query);
            if (!resultDeletingOneOrder || resultDeletingOneOrder.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Đơn hàng có mã đơn hàng ${req.query.order_id} không tồn tại hoặc quá hạn để huỷ.`,
                });
            }
        }
        else {
            const resultDeletingOneOrder = await ordersService.cancelOrderWithoutTimeConstraint(req.query);

            if (resultDeletingOneOrder || resultDeletingOneOrder.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Đơn hàng ${req.query.order_id} quá hạn để hủy hoặc không tồn tại.`,
                });
            }
        }

        return res.status(200).json({
            error: false,
            message: `Hủy đơn hàng ${req.query.order_id} thành công.`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const updateImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: true,
                message: "Ảnh không được để trống.",
            });
        }
        const { error } = orderValidation.validateQueryUpdatingOrderImages(req.query);
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }
        const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);

        const resultGettingOneShipperTasks = await shippersService.getTasks({ order_id: req.query.order_id, staff_id: req.user.staff_id }, postalCode);
        if (!resultGettingOneShipperTasks || resultGettingOneShipperTasks.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
            });
        }

        if (resultGettingOneShipperTasks[0].completed) {
            return res.status(409).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không còn khả năng cập nhật.`,
            });
        }

        const resultGettingOneOrder = await ordersService.getOneOrder({ order_id: req.query.order_id });
        if (!resultGettingOneOrder || resultGettingOneOrder.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
            });
        }

        let images;
        try {
            if (req.query.type === "send") {
                images = resultGettingOneOrder[0].send_images ? JSON.parse(resultGettingOneOrder[0].send_images) : new Array();
            }
            else {
                images = resultGettingOneOrder[0].receive_images ? JSON.parse(resultGettingOneOrder[0].receive_images) : new Array();
            }
        } catch (error) {
            images = new Array();
        }
        console.log(images.length + req.files.length);
        if (images.length + req.files.length > 2) {
            return res.status(409).json({
                error: true,
                message: `Quá số lượng ảnh cho phép. Số lượng ảnh còn lại được cho phép: ${ 2 - images.length > 0 ? 2 - images.length : 0 }.`,
            });
        }
        

        req.files.forEach(file => {
            images.push(file.filename);
        });

        const updatedImages = new Object();
        if (req.query.type === "send") {
            updatedImages.send_images = JSON.stringify(images);
        }
        else if (req.query.type === "receive") {
            updatedImages.receive_images = JSON.stringify(images);
        }
        
        const resultUpdatingOneOrderInAgency = await ordersService.updateOrder(updatedImages, { order_id: req.query.order_id }, postalCode);
        if (!resultUpdatingOneOrderInAgency || resultUpdatingOneOrderInAgency.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
            });
        }
        await ordersService.updateOrder(updatedImages, { order_id: req.query.order_id });
        
        const tempFolderPath = path.join("storage", "order", "image", "order_temp");
        if (!fs.existsSync(tempFolderPath)) {
            fs.mkdirSync(tempFolderPath);
        }
        
        const officialFolderPath = path.join("storage", "order", "image", "order");
        if (!fs.existsSync(officialFolderPath)) {
            fs.mkdirSync(officialFolderPath);
        }

        req.files.forEach(file => {
            const tempFilePath = path.join(tempFolderPath, file.filename);
            if (fs.existsSync(tempFilePath)) {
                const officialFilePath = path.join(officialFolderPath, file.filename);
                fs.renameSync(tempFilePath, officialFilePath);
            }
        });

        return res.status(201).json({
            error: false,
            message: `Cập nhật ảnh đơn hàng ${req.query.order_id} thành công.`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getImages = async (req, res) => {
    try {
        const { error } = orderValidation.validateQueryUpdatingOrderImages(req.query);
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultGettingOneOrder = await ordersService.getOneOrder({ order_id: req.query.order_id });
        if (!resultGettingOneOrder || resultGettingOneOrder.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
            });
        }

        let images;
        try {
            if (req.query.type === "send") {
                images = resultGettingOneOrder[0].send_images ? JSON.parse(resultGettingOneOrder[0].send_images) : new Array();
            }
            else if (req.query.type === "receive") {
                images = resultGettingOneOrder[0].receive_images ? JSON.parse(resultGettingOneOrder[0].receive_images) : new Array();
            }
        } catch (error) {
            images = new Array();
        }

        const folderPath = "storage/order/image/order/";
        images = images.map(image => folderPath + image);

        const archive = archiver("zip");
        archive.on('error', function(err) {
            res.status(500).send({error: err.message});
        });
    
        res.attachment('images.zip');
    
        archive.pipe(res);
    
        // for (const image of images) {
        //     const exists = await fs.access(image).then(() => true).catch(() => false);
        //     if (exists) {
        //         archive.file(image, { name: path.basename(image) });
        //     } else {
        //         console.warn(`Image file not found: ${image}`);
        //     }
        // }

        images.forEach(image => {
            archive.file(image, { name: image });
        });

        archive.finalize();
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const updateSignature = async (req, res) => {
    try {
        if (!req.file || req.file.length === 0) {
            return res.status(400).json({
                error: true,
                message: "Ảnh không được để trống.",
            });
        }
		const { error } = orderValidation.validateQueryUpdatingOrderImages(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);

        const resultGettingOneShipperTasks = await shippersService.getTasks({ order_id: req.query.order_id, staff_id: req.user.staff_id }, postalCode);
        if (!resultGettingOneShipperTasks || resultGettingOneShipperTasks.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
            });
        }

        if (resultGettingOneShipperTasks[0].completed) {
            return res.status(409).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không còn khả năng cập nhật.`,
            });
        }

        const resultGettingOneOrder = await ordersService.getOneOrder({ order_id: req.query.order_id });
        if (!resultGettingOneOrder || resultGettingOneOrder.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
            });
        }
    
        const filename = req.file.filename;
      
        const updatedImages = new Object();
        if (req.query.type === "send") {
            updatedImages.send_signature = filename;
        }
        else if (req.query.type === "receive") {
            updatedImages.receive_signature = filename;
        }
        
        const resultUpdatingOneOrderInAgency = await ordersService.updateOrder(updatedImages, { order_id: req.query.order_id }, postalCode);
        if (!resultUpdatingOneOrderInAgency || resultUpdatingOneOrderInAgency.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
            });
        }
        await ordersService.updateOrder(updatedImages, { order_id: req.query.order_id });
        
        const tempFolderPath = path.join("storage", "order", "image", "signature_temp");
        if (!fs.existsSync(tempFolderPath)) {
            fs.mkdirSync(tempFolderPath);
        }
        
        const officialFolderPath = path.join("storage", "order", "image", "signature");
        if (!fs.existsSync(officialFolderPath)) {
            fs.mkdirSync(officialFolderPath);
        }

        const tempFilePath = path.join(tempFolderPath, filename);
		const officialFilePath = path.join(officialFolderPath, filename);
        fs.renameSync(tempFilePath, officialFilePath);

		return res.status(201).json({
			error: false,
			message: `Cập nhật chữ kí cho đơn hàng ${req.query.order_id} thành công.`,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const getSignature = async (req, res) => {
    try {
        const { error } = orderValidation.validateQueryUpdatingOrderImages(req.query);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultGettingOneOrder = await ordersService.getOneOrder({ order_id: req.query.order_id });
        if (!resultGettingOneOrder || resultGettingOneOrder.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
            });
        }

        const order = resultGettingOneOrder[0];
        let fileName;
        if(req.query.type === "send") {
            fileName = order.send_signature;
        } else if(req.query.type === "receive") {
            fileName = order.receive_signature;
        }
    
        if (fileName) {
            const file = path.join(__dirname, "..", "storage", "order", "image", "signature", fileName);
            if (fs.existsSync(file)) {
                    return res.status(200).sendFile(file);
            }
        }

        return res.status(404).json({
            error: true,
            message: "Không tìm thấy dữ liệu",
        });
    } catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
    
}

module.exports = {
    checkExistOrder,
    getOrders,
    checkFileFormat,
    createNewOrder,
    createOrdersByFile,
    updateOrder,
    cancelOrder,
    calculateServiceFee,
    updateImages,
    getImages,
    updateSignature,
    getSignature,
}