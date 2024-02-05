const bcrypt = require("bcrypt");

const hash = (password) => {
    const salt = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS));
    const hashPassword = bcrypt.hashSync(password, salt);
    return hashPassword;
}

const setSession = (user, done) => {
    done(null, user);
}

const verifyPermission = (user, done) => {
    return done(null, user);
}

class User {
    isAuthenticated = () => {
        return (req, res, next) => {
            if (!req.isAuthenticated()) {
                return res.status(403).json({
                    error: true,
                    message: "Người dùng không được phép truy cập tài nguyên này."
                });
            }
    
            next();
        }
    }

    isAuthorized = (roles, privileges) => {
        return (req, res, next) => {
            for (const role of roles) {
                if (req.user.role === role) {
                    return next();
                }
            }

            for (const privilege of privileges) {
                if (req.user.privileges.includes(privilege)) {
                    return next();
                }
            }
    
            return res.status(403).json({
                error: true,
                message: "Người dùng không được phép truy cập tài nguyên này.",
            });
        }
    }
}

module.exports = {
    hash,
    setSession,
    verifyPermission,
    User,
}
