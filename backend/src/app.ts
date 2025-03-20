import express from "express";
import mongoose from "mongoose";
import path from "path";
// import { errors } from 'celebrate';
import { requestLogger, errorLogger } from "./middlewares/loggers";
import cors from "cors";

import cookieParser from "cookie-parser";

import { port, corsOrigin, dbAddress, uploadPath } from "./config";
import productsRouter from "./routes/products";
import uploadRouter from "./routes/upload";
import orderRouter from "./routes/order";
import userRouter from "./routes/users";
import { errorsHandler } from "./middlewares/error-handler";

const app = express();

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Возможно, тут не нужен

mongoose.connect(dbAddress);

app.use(requestLogger);

// Рауты
app.use(express.static(path.join(__dirname, 'public')));
app.use("/auth", userRouter);
app.use("/product", productsRouter);
app.use("/upload", uploadRouter);
app.use("/order", orderRouter);

app.use(errorLogger);

app.use(errorsHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
