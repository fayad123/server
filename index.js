require("dotenv").config({
	path: [`.env.production`, `.env`],
});
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const chalk = require("chalk");
const services = require("./routes/services");
const bookings = require("./routes/booking");
const messages = require("./routes/messages");
const users = require("./routes/users");
const businessUsers = require("./routes/businessUsers");
// const Search = require("./routes/search");

const expressRoutes = require("express-list-routes");
const {logger, logToFile} = require("./utils/logToFile");
const morgan = require("morgan");

const app = express();

const port = process.env.PORT;

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log(chalk.green("Connected to MongoDB")))
	.catch((err) => console.error(chalk.red("MongoDB connection error:", err)));

// Middlewares
app.use(express.json());
app.use(
	cors({
		origin: ["http://localhost:5173", "https://client-afrahna.vercel.app"],
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	next();
});

app.use(helmet());
app.use(logger);
// app.use(morgan("combined"));
logToFile();

// routes
app.use("/api/business", businessUsers);
app.use("/api/users", users);
app.use("/api/services", services);
app.use("/api/bookings", bookings);
app.use("/api/messages", messages);
// app.use("/api/search", Search);

// app litener
app.listen(port, () => {
	console.log("Server started on port", port);
});

if (process.env.NODE_ENV === "development") {
	console.log(chalk.bgWhite.red.bold("App is running in Development mode"));
	expressRoutes(app);
} else {
	console.log(chalk.bgWhiteBright.bold("App is running in Production mode"));
}
