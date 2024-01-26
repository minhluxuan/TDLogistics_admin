const authorizationService = require("../services/authorizationService");
const utils = require("./utils");

const authorizationValidation = new utils.AuthorizationValidation();

const getPermission = async (req, res) => {
    const { error } = authorizationValidation.validateFindingAuthorization(req.query);

    if (error) {
        return res.status(400).json({
            error: true,
            message: "Thông tin không hợp lệ.",
        });
    }

    const reader_id = req.user.staff || req.user.agency_id;
    const read_object_id = req.query.personnel_id;
    const primaryPermissionOfReader = req.user.permission.primary;

    const isAllowedAction = authorizationValidation.isAllowedToRead(reader_id, read_object_id, primaryPermissionOfReader);

    if (!isAllowedAction) {
        return res.status(403).json({
            error: true,
            message: "Hành động không được cho phép.",
        });
    }

    try {
        const result = await authorizationService.getAuthorization(read_object_id);

        res.status(200).json({
            error: false,
            data: result ? JSON.parse(result) : new Object({ primary: [], privillege: [] }),
            message: "Lấy thông tin thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        })
    }
}

const updatePermission = async (req, res) => {
    const { error } = authorizationValidation.validateUpdatingAuthorization(req.body);

    if (error) {
        return res.status(400).json({
            error: true,
            message: "Thông tin không hợp lệ.",
        });
    }

    const giver_id = req.user.staff_id || req.user.agency_id;
    const receiver_id = req.body.personnel_id;
    const primaryPermissionOfGiver = req.user.permission.primary;
    const givenPermissions = req.body.permissions;
    const postal_code = req.user.postal_code;

    const isAllowedAction = authorizationValidation.isAllowedToGrant(giver_id, receiver_id, primaryPermissionOfGiver, givenPermissions);

    if (!isAllowedAction) {
        return res.status(403).json({
            error: true,
            message: "Hành động không được cho phép",
        });
    }

    try {
        const result = await authorizationService.updateAuthorization(receiver_id, givenPermissions);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true, 
                message: "Nhân sự không tồn tại.",
            });
        }

        return res.status(201).json({
            error: false,
            info: result,
            message: "Cấp quyền thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const deletePermission = async (req, res) => {
    const { error } = authorizationValidation.validateDeletingAuthorization(req.body);

    if (error) {
        return res.status(400).json({
            error: true,
            message: "Thông tin không hợp lệ.",
        });
    }

    const revoker_id = req.user.staff_id || req.user.agency_id;
    const loser_id = req.body.personnel_id;
    const primaryPermissionOfRevoker = req.user.permission.primary;
    const revokedPermissions = req.body.permissions;

    const isAllowedAction = authorizationValidation.isAllowedToRevoke(revoker_id, loser_id, primaryPermissionOfRevoker, revokedPermissions);

    if (!isAllowedAction) {
        return res.status(403).json({
            error: true,
            message: "Hành động không được cho phép.",
        });
    }

    try {
        const result = await authorizationService.deleteAuthorization(revoker_id, revokedPermissions);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: "Người dùng không tồn tại.",
            });
        }

        return res.status(201).json({
            error: false,
            info: result,
            message: "Thu hồi quyền thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

module.exports = {
    getPermission,
    updatePermission,
    deletePermission,
}