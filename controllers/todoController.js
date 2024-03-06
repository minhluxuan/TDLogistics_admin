(req.query);
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }
        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER".includes(req.user.role)]) {
            if (req.body.staff_id) {
                delete req.body.staff_id;
            }
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
            delete req.body.staff_id;
            req.body.postal_code = retrivePostalcode(req.body.staff_id);

            const result = await scheduleService.updateScheduleByAgency(req.body, req.query);
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
        const { error } = scheduleValidation.validateDeletingSchedule(req.body);
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
            const tempSchedule = new Object({
                id: req.body.id,
                postal_code: retrivePostalcode(req.body.staff_id),
            });
            const result = await scheduleService.deleteScheduleByAgency(tempSchedule);
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
