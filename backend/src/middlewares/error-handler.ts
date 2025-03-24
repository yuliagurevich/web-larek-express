import { CelebrateError, isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-reqest-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';

function errorsHandler(
  err: BadRequestError | NotFoundError | ConflictError | CelebrateError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  let status = 0;
  let message;

  if (isCelebrateError(err)) {
    status = 400;
    message = err.details.get('body')?.details[0].message;
  } else if (
    err instanceof BadRequestError
    || err instanceof ConflictError
    || err instanceof UnauthorizedError
    || err instanceof NotFoundError
  ) {
    status = err.statusCode;
    message = err.message;
  } else {
    status = 500;
    message = 'Произошла ошибка';
  }

  return res.status(status).send({ message });
}

export default errorsHandler;
