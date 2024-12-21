import { CelebrateError, isCelebrateError } from 'celebrate';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from 'errors/bad-reqest-error';
import ConflictError from 'errors/conflict-error';
import NotFoundError from 'errors/not-found-error';
import { NextFunction, Request, Response } from 'express';



function formatCelebrateError(err: CelebrateError) {
    console.log('CelebrateError', CelebrateError);
    const details = Array.from(err?.details?.values());

    return `${err.message}: ${details.map(e => e.message).join(', ')}`;
}

export function errorsHandler(
    err: BadRequestError | NotFoundError | ConflictError | CelebrateError,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    let status: number;
    let message: string;

    if (isCelebrateError(err)) {
        status = 400;
        message = formatCelebrateError(err);
    } else if (err instanceof Error && err.message.includes('E11000')) {
        // обработка ошибки
        status = 409
        message = ''
        
    } else if (err instanceof MongooseError.ValidationError) {
        // return next(new BadRequestError(err.message));
        status = 400
        message = ''
    } else {
        console.log('err', err)
        status = err?.statusCode || 500;
        // message = err.message || 'Internal Server Error';
        message = 'Я понятия не имею, что упало'
    }

    return res.status(status).send({ message, status });
}
