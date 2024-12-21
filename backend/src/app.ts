import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
// import { errors } from 'celebrate';
import cors from 'cors';
import winston from 'winston';
import expressWinston from 'express-winston';

import { port, dbAddress } from './config';
import productsRouter from './routes/products';
import orderRouter from './routes/order';
import userRouter from './routes/users';
import { errorsHandler } from './middlewares/error-handler';

// Логгер запросов на сервер
const requestLogger = expressWinston.logger({
    transports: [
        new winston.transports.File({ filename: 'request.log'}),
        new winston.transports.Console()
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

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(dbAddress);

app.use(requestLogger);

app.use('/auth', userRouter);
app.use('/product', productsRouter);
app.use('/order', orderRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorLogger);

app.use(errorsHandler);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});