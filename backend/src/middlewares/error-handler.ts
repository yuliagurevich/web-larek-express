import { CelebrateError, isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-reqest-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';

export function errorsHandler(
  err: BadRequestError | NotFoundError | ConflictError | CelebrateError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let status = 0;
  let message;

  if (isCelebrateError(err)) {
    status = 400;
    message = err.details.get('body')?.details[0].message;
  } else if (err instanceof BadRequestError) {
    status = err.statusCode;
    message = err.message;
  } else if (err instanceof ConflictError) {
    status = err.statusCode;
    message = err.message;
  } else if (err instanceof UnauthorizedError) {
    status = err.statusCode;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    status = err.statusCode;
    message = err.message;
  } else {
    status = 500;
    message = 'Произошла ошибка';
  }

  return res.status(status).send({ message });
}
