const validation = require("../lib/validation");
const scheduleValidation = new validation.ScheduleValidation();
const moment = require("moment");
const scheduleService = require("../services/scheduleService");
const utils = require("../lib/utils");

const createNewSchedule = async (req, res) => {
    try {
        const { error } = scheduleValidation.validateCreateSchedule(req.body);
        if (error) {
            return res.status(400).json({
                error: error,
                message: "Thông tin không hợp lệ.",
            });
        }

        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER"].includes(req.user.role)) {
            const newSchedule = new Object({
                task: req.body.task,
                priority: req.body.priority,
                deadline: req.body.deadline,
                created_at: moment(new Date()).format("YYYY-MM-DD HH:MM:SS"),
                completed: false,
            });

            const resultCreatingNewTask = await scheduleService.createScheduleByAdmin(newSchedule);
            
            if (!resultCreatingNewTask || resultCreatingNewTask.affectedRows === 0) {
                return res.status(409).json({
                    error: true,
                    message: "Tạo công việc mới thất bại.",
                });
            }

            return res.status(201).json({
                error: false,
                messege: "Tạo công việc mới thành công.",
            });
        }
        if (
            ["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER"].includes(
                req.user.role
            )
        ) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);
            const newSchedule = new Object({
                task: req.body.task,
                priority: req.body.priority,
                deadline: req.body.deadline,
                created_at: moment(new Date()).format("YYYY-MM-DD HH:MM:SS"),
                completed: false,
            });

            const resultCreatingNewTask = await scheduleService.createScheduleByAgency(newSchedule, postalCode);
            
            if (!resultCreatingNewTask || resultCreatingNewTask.affectedRows === 0) {
                return res.status(409).json({
                    error: true,
                    message: "Tạo công việc mới thất bại.",
                });
            }

            return res.status(200).json({
                error: false,
                message: "Tạo công việc mới thành công.",
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

const getSchedule = async (req, res) => {
    try {
        const { error } = scheduleValidation.validateFindingSchedule(req.body);
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER".includes(req.user.role)]) {
            const result = await scheduleService.getScheduleByAdmin(req.body);
            
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy công việc thành công.",
            });
        }

        if (
            ["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER"].includes(
                req.user.role
            )
        ) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);

            const result = await scheduleService.updateScheduleByAgency(req.body, postalCode);
            
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy công việc thành công.",
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

const updateSchedule = async (req, res) => {
    try {
        const { error: error2 } = scheduleValidation.validateIDSchedule(req.query);
        if (error2) {
            return res.status(400).json({
                error: true,
                message: error2.message,
            });
        }

        const { error: error1 } = scheduleValidation.validateUpdatingSchedule(req.body);
        if (error1) {
            return res.status(400).json({
                error: true,
                message: error1.message,
            });
        }

        if (req.body.completed) {
            //if completed is update a gain, this will still pass
            req.body.complete_at = moment(new Date()).format("YYYY-MM-DD HH:MM:SS");
        }
        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER".includes(req.user.role)]) {
            const result = await scheduleService.updateScheduleByAdmin(req.body, req.query);
            if (!result || result[0].affetedRows <= 0) {
                return res.status(404).json({
                    error: true,
                    message: "Task không tồn tại.",
                });
            }
            return res.status(200).json({
                error: false,
                message: result,
            });
        }
        if (
            ["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER"].includes(
                req.user.role
            )
        ) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);

            const result = await scheduleService.updateScheduleByAgency(req.body, req.query, postalCode);
            if (!result || result[0].affetedRows <= 0) {
                return res.status(404).json({
                    error: true,
                    message: "Task không tồn tại.",
                });
            }
            return res.status(200).json({
                error: false,
                message: result,
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

const deleteSchedule = async (req, res) => {
    try {
        const { error } = scheduleValidation.validateIDSchedule(req.body);
        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER".includes(req.user.role)]) {
            const tempSchedule = new Object({
                id: req.body.id,
            });
            const result = await scheduleService.deleteScheduleByAdmin(tempSchedule);
            if (!result || result[0].affetedRows <= 0) {
                return res.status(404).json({
                    error: true,
                    message: "Task không tồn tại.",
                });
            }
            return res.status(200).json({
                error: false,
                message: result,
            });
        }
        if (
            ["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER"].includes(
                req.user.role
            )
        ) {
            const postalCode = utils.getPostalCodeFromAgencyID(req.body.staff_id);

            const tempSchedule = new Object({
                id: req.body.id,
            });
            const result = await scheduleService.deleteScheduleByAgency(tempSchedule, postalCode);
            if (!result || result[0].affetedRows <= 0) {
                return res.status(404).json({
                    error: true,
                    message: "Task không tồn tại.",
                });
            }
            return res.status(200).json({
                error: false,
                message: result,
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
module.exports = {
    createNewSchedule,
    getSchedule,
    updateSchedule,
    deleteSchedule,
};