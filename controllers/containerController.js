const containerService = require("../services/containerService");
const utils = require("./utils");

const createContainer = async (req, res) => {
    // if(!req.isAuthenticated() || req.user.permisson < 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }

    try {
        const containerRequestValidation = new utils.ContainerValidation(req.body);
        const { error } = containerRequestValidation.validateCreatingConatiner();

        if(error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }
    
        const vehicleType = req.body.type;
        const shipmentID = req.body.shipment_id;
        const containerID = req.body.container_id;

        if(vehicleType === "train" || vehicleType === "plane") {
            const result = await containerService.createContainer(shipmentID, containerID);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Khởi tạo container thành công!",
            });
        }
        else {
            return res.status(500).json({
                error: true,
                message: "Loại hình vận tải không phù hợp!",
            });
        }

    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }

}

const updateContainer = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission < 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }

    try {

        const containerRequestValidation = new utils.ContainerValidation(req.body);
        const { error } = containerRequestValidation.validateUpdatingConatiner();

        if(error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        const choice = req.body.choice;
        const shipmentID = req.body.shipment_id;
        const containerID = req.body.container_id;
        
        if(choice === "in") {
            const result = await containerService.updateInContainer(shipmentID, containerID);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lên hàng thành công!",
            });
        }
        else if(choice === "out") {
            const result = await containerService.updateOutContainer(shipmentID, containerID);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Xuống hàng thành công!",
            });
        }
        else {
            return res.status(500).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

    } catch(error) {
        console.log("Controller Error: ", error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }

}

const getContainer = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission < 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    
    try {

        const containerRequestValidation = new utils.ContainerValidation(req.body);
        const { error } = containerRequestValidation.validateFindingConatiner();

        if(error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        const containerID = req.body.container_id;
        const result = await containerService.getContainer(containerID);
        return res.status(200).json({
            error: false,
            data: result,
            message: "Lấy thông tin thành công!",
        })

    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }

}

module.exports = {
    createContainer,
    updateContainer,
    getContainer,
};