import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
// import { errors } from 'celebrate';
import cors from 'cors';
import winston from 'winston';
import expressWinston from 'express-winston';
import cookieParser from 'cookie-parser';

import { port, corsOrigin, dbAddress } from './config';
import productsRouter from './routes/products';
import orderRouter from './routes/order';
import userRouter from './routes/users';
import { errorsHandler } from './middlewares/error-handler';

// Логгер запросов на сервер
const requestLogger = expressWinston.logger({
    transports: [
        new winston.transports.File({ filename: 'request.log'}),
        // new winston.transports.Console()
    ],
    format: winston.format.json()
});

// Логгер ошибок
const errorLogger = expressWinston.errorLogger({
    transports: [
        new winston.transports.File({ filename: 'error.log' })
    ],
    format: winston.format.json()
})

const app = express();

app.use(cors({
    origin: corsOrigin,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Возможно, тут не нужен

mongoose.connect(dbAddress);

app.use(requestLogger);

// Рауты
app.use('/auth', userRouter);
app.use('/product', productsRouter);
app.use('/order', orderRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorLogger);

app.use(errorsHandler);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});