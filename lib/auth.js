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
                    message: "Bạn không được phép truy cập tài nguyên này."
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

module.exports = new Auth();