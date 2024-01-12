const setSession = (user, done) => {
    done(null, { user_id: user.user_id, phone_number: user.phone_number, permission: user.permission });
}

const verifyPermission = (user, done) => {
    if (user.permission > 0) {
        return done(null, {
            user_id: user.user_id,
            phone_number: user.phone_number,
            permission: user.permission,
            active: true,
        });
    }
    done(null, false);
}

module.exports = {
    setSession,
    verifyPermission,
}