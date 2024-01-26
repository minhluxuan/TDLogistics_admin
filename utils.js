const bcrypt = require("bcrypt");

const hash = (password) => {
    const salt = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS));
    const hashPassword = bcrypt.hashSync(password, salt);
    return hashPassword;
}


const setStaffSession = (staff, done) => {
    done(null, { staff_id: staff.staff_id, agency_id: staff.agency_id, permission: staff.permission });
}

const setAgencySession = (agency, done) => {
    done(null, { agency_id: agency.agency_id,  permission: agency.permission });
}

const verifyAgencyPermission = (agency, done) => {
    if (agency.permission === 2) {
        return done(null, {
            agency_id: agency.agency_id,
            permission: agency.permission,
        });
    }
    done(null, false);
}

const verifyStaffPermission = (staff, done) => {
    if (staff.permission === 2) {
        return done(null, {
            staff_id: staff.staff_id,
            agency_id: staff.agency_id,
            permission: staff.permission,
        });
    }
    done(null, false);
}

const isAuthenticated = (permission) => {
    return (req, res, next) => {
        if (!req.isAuthenticated() || req.user.permission !== permission) {
            return res.status(403).json({
                error: true,
                message: "Bạn không được phép truy cập tài nguyên này."
            });
        }

        next();
    }
}


module.exports = {
    hash,
    setStaffSession,
    setAgencySession,
    verifyStaffPermission,
    verifyAgencyPermission,
    isAuthenticated
}
