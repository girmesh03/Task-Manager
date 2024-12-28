import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import corsOptions from "./config/corsOptions.js";
import globalErrorHandler from "./controllers/errorController.js";
import CustomError from "./utils/CustomError.js";

const app = express();

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api", (req, res, next) => {
  res.status(200).json({ msg: "API is running" });
});

app.all("*", (req, res, next) => {
  next(new CustomError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
