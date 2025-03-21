import winston from 'winston';
import expressWinston from 'express-winston';

// Логгер запросов на сервер
export const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: 'request.log' }),
    // new winston.transports.Console()
  ],
  format: winston.format.json(),
});

// Логгер ошибок
export const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
  ],
  format: winston.format.json(),
});
