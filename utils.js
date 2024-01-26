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
                    message: "Bạn không được phép truy cập tài nguyên này."
                });
            }
    
            next();
        }
    }

    isAuthorized = (...args) => {
        return (req, res, next) => {
            for (const arg of args) {
                if (req.user.permission.primary.includes(arg) || req.user.permission.privilege.includes(arg)) {
                    return next();
                }
            }
    
            return res.status(403).json({
                error: true,
                message: "Bạn không được phép truy cập tài nguyên này.",
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
