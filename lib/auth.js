class Auth {
    setSession = (user, done) => {
        done(null, user);
    }
    
    verifyPermission = (user, done) => {
        return done(null, user);
    }

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

    isAuthorized = (roles, privileges = null) => {
        return (req, res, next) => {
            for (const role of roles) {
                if (req.user.role === role) {
                    return next();
                }
            }

            if (privileges !== null) {
                for (const privilege of privileges) {
                    if (req.user.privileges.includes(privilege)) {
                        return next();
                    }
                }
            }
    
            return res.status(403).json({
                error: true,
                message: "Người dùng không được phép truy cập tài nguyên này.",
            });
        }
    }

    isActive = () => {
        return (req, res, next) => {
            if (req.user.active) {
                return next();
            }

            return res.status(403).json({
                error: true,
                message: "Tài khoản người dùng chưa được kích hoạt. Vui lòng đổi mật khẩu để kích hoạt tài khoản.",
            });
        }
    }
}

module.exports = new Auth();