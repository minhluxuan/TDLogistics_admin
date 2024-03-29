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
const scheduleRouter = require("./routes/scheduleRoute");
const administrativeRouter = require("./routes/administrativeRoute");
const routesRouter = require("./routes/routeRoute");

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
const allowedOrigins = ['https://admin.tdlogistics.net.vn', 'https://app.tdlogistics.net.vn', 'https://delivery.tdlogistics.net.vn', 'http://localhost:5000', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'https://customer-merchant-web.vercel.app', 'https://testwebmerchant.vercel.app', "https://admin-td-logistics-web.vercel.app"];

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
morgan.token("remote-user", function (req) {
    return req.user ? req.user.staff_id : "Guest";
});
morgan.token("remote-user-role", function(req) {
	return req.user ? req.user.role : "undefined";
})
const morganMiddleware = morgan(
	':remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms',
	{
	  stream: {
		write: (message) => {
			const logObject = parseLogMessage(message);
			console.log(logObject);
			logger.http(logObject);
		},
	  },
	}
);
  
function parseLogMessage(message) {
	const parts = message.split(' ');
  
	return {
		remoteAddr: parts[0],
		remoteUser: parts[1],
		remoteUserRole: parts[2],
		method: parts[2],
		url: parts[3],
		httpVersion: parts[4],
		status: parts[5],
		contentLength: parts[6],
		responseTime: parts[8],
	};
}
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
app.use("/api/v1/schedules", scheduleRouter);
app.use("/api/v1/administrative", administrativeRouter);
app.use("/api/v1/routes", routesRouter);
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
