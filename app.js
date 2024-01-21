const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const mysql = require("mysql2");
const cron = require("cron");
const cors = require("cors");
const flash = require("express-flash");
const passport = require("passport");
const dotenv = require("dotenv");
dotenv.config();

//const indexRouter = require("./routes/index");
//const otpRouter = require("./routes/otpRoute");
// const staffsRouter = require("./routes/staffsRoute");
const vehicelRouter = require("./routes/vehicleRoute");

// const dbOptions = {
//     host: process.env.HOST,
//     port: process.env.DBPORT,
//     user: process.env.USER,
//     password: process.env.PASSWORD,
//     database: process.env.DATABASE,
// };

// const pool = mysql.createPool(dbOptions);

// const sessionStore = new MySQLStore({}, pool);

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.enable("trust proxy");

// Chỉ định danh sách các trang web được phép truy cập
const allowedOrigins = ["https://customer-merchant-web.vercel.app", "https://testwebmerchant.vercel.app"];

// Sử dụng cors middleware với tùy chọn chỉ cho phép các trang web trong danh sách
// app.use(cors({
// 	origin: function (origin, callback) {
// 		if (!origin || allowedOrigins.includes(origin)) {
// 		callback(null, true);
// 		} else {
// 		callback(new Error('Not allowed by CORS'));
// 		}
// 	},
// 	// Thêm các tùy chọn khác nếu cần thiết
// 	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
// 	credentials: true,
// }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({
// 	secret: process.env.SESSION_SECRET,
// 	resave: false,
// 	saveUninitialized: false,
// 	store: sessionStore,
// 	cookie: {
// 		secure: false,
// 		sameSite: 'None',
// 		httpOnly: false,
// 		maxAge: 60 * 60 * 1000,
// 	}
// }));
// app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());

// app.use("/", indexRouter);
// app.use("/api/v1/staffs", staffsRouter);
// app.use("/api/v1/otp", otpRouter);
app.use("/api/v1/vehicle", vehicelRouter);
app.use("/get_session", (req, res) => {
    console.log(req.user);
    res.status(200).json({
        error: false,
        message: "Lấy phiên đăng nhập thành công.",
    });
});
app.get("/destroy_session", (req, res) => {
    req.logout(() => {
        req.session.destroy();
    });
    return res.status(200).json({
        error: false,
        message: "Hủy phiên hoạt động thành công.",
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

// const cleanUpExpiredSession = new cron.CronJob("0 */12 * * *", async () => {
//     try {
//         const currentTime = new Date();
//         await sessionStore.clearExpiredSessions(currentTime);
//         console.log("Expired sessions has been cleared successfully!");
//     } catch (err) {
//         console.log("Error cleaning up expired session: ", err);
//     }
// });

// cleanUpExpiredSession.start();

app.listen(3000, () => {
    console.log("listening on 3000");
});

// module.exports = app;
