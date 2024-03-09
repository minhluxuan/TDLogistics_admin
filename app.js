const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const logger = require("./lib/logger");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const mysql = require("mysql2");
const cron = require("cron");
const cors = require("cors");
const flash = require("express-flash");
const passport = require("passport");
const auth = require("./lib/auth");
const dotenv = require("dotenv");
dotenv.config();

const indexRouter = require('./routes/index');


const otpRouter = require("./routes/otpRoute");
const staffsRouter = require("./routes/staffsRoute");
const businessRouter = require("./routes/businessRoute");
const shipmentsRouter = require("./routes/shipmentsRoute");
const containersRouter = require("./routes/containersRoute");
const vehicleRouter = require("./routes/vehicleRoute");
const authorizationRouter = require("./routes/authorizationRoute");
const transportPartnersRouter = require("./routes/transportPartnerRoute");
const partnerStaffsRouter = require("./routes/partnerStaffsRoute");
const otpPartnerStaffRouter = require("./routes/otpPartnerStaffRoute");
const agenciesRouter = require("./routes/agenciesRoute");
const usersRouter = require("./routes/usersRoute");
const ordersRouter = require("./routes/ordersRoute");
const shippersRouter = require("./routes/shippersRoute");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const pool = mysql.createPool(dbOptions);
  
const sessionStore = new MySQLStore({}, pool);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.enable('trust proxy');

// Chỉ định danh sách các trang web được phép truy cập
const allowedOrigins = ['http://localhost:5000', 'https://customer-merchant-web.vercel.app', 'https://testwebmerchant.vercel.app', "https://admin-td-logistics-web.vercel.app"];

// Sử dụng cors middleware với tùy chọn chỉ cho phép các trang web trong danh sách
app.use(cors({
	origin: function (origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	// Thêm các tùy chọn khác nếu cần thiết
	methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
	credentials: true,
}));

const sessionMiddleware = session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: sessionStore,
	cookie: {
		// secure: false,
		// sameSite: 'None',
		httpOnly: false,
		maxAge: 12 * 60 * 60 * 1000,
	}
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);


app.use("/api/v1/staffs", staffsRouter);
app.use("/api/v1/otp", otpRouter);
app.use("/api/v1/business", businessRouter);
app.use("/api/v1/shipments", shipmentsRouter);
app.use("/api/v1/containers", containersRouter);
app.use("/api/v1/vehicles", vehicleRouter);
app.use("/api/v1/partner_staffs", partnerStaffsRouter);
app.use("/api/v1/transport_partners", transportPartnersRouter);
app.use("/api/v1/otp_partner_staff", otpPartnerStaffRouter);
app.use("/api/v1/agencies", agenciesRouter);
app.use("/api/v1/authorization", authorizationRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/shippers", shippersRouter);
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

passport.serializeUser(auth.setSession);
passport.deserializeUser((user, done) => {
	auth.verifyPermission(user, done);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});
// console.log(require("./lib/utils").hash("NTDung@tdlogistics2k24"));
const cleanUpExpiredSession = new cron.CronJob("0 */12 * * *", async () => {
	try {
		const currentTime = new Date();
		await sessionStore.clearExpiredSessions(currentTime);
		console.log("Expired sessions has been cleared successfully!");
	} catch (err) {
	  	console.log("Error cleaning up expired session: ", err);
	}
});

cleanUpExpiredSession.start();

module.exports = {
	app,
	sessionMiddleware,
};
