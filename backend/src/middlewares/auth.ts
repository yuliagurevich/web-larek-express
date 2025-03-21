import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { accessTokenSecretKey } from '../config';
import userModel, { AuthenticatedRequest } from '../models/user';
import UnauthorizedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';

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

  let user;

  try {
    user = await userModel.findById(payload);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    // Если _id пользователь не найден 404
    return next(new NotFoundError('Пользователь не найден'));
  }

  req.user = user;

  return next();
};

export default auth;
