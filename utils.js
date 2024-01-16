const setStaffSession = (staff, done) => {
    done(null, { staff_id: staff.staff_id, agency_id: staff.agency_id, permission: staff.permission });
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

module.exports = {
    setStaffSession,
    verifyStaffPermission,
}