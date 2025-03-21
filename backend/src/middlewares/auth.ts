import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { accessTokenSecretKey } from '../config';
import { AuthenticatedRequest } from '../models/user';
import UnauthorizedError from '../errors/unauthorized-error';

const auth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const accessToken = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(accessToken, accessTokenSecretKey);
  } catch (error) {
    // Если _id полученный по токену невалиден 400
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  req.userId = payload;

  return next();
};

export default auth;
