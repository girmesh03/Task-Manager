import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
// import morgan from "morgan";

import corsOptions from "./config/corsOptions.js";
import globalErrorHandler from "./controllers/errorController.js";
import CustomError from "../backend/utils/CustomError.js";

import AuthRoutes from "./routes/AuthRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import TaskRoutes from "./routes/TaskRoutes.js";

const app = express();

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(cookieParser());
// app.use(morgan("dev"));

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/tasks", TaskRoutes);

app.all("*", (req, res, next) => {
  next(new CustomError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
