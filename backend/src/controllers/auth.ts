import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import userModel, { AuthenticatedRequest } from '../models/user';
import {
  accessTokenSecretKey,
  refreshTokenSecretKey,
  accessTokenLifetime,
  refreshTokenLifetime,
} from '../config';
import timeToMilliseconds from '../utils/timeUtils';
import NotFoundError from '../errors/not-found-error';
import BadRequestError from '../errors/bad-reqest-error';
import ConflictError from '../errors/conflict-error';
import UnauthorizedError from '../errors/unauthorized-error';

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  let user;

  try {
    user = await userModel.findById(userId);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    // Если _id пользователь не найден 404
    return next(new NotFoundError('Пользователь не найден'));
  }

  return res.send({
    user: {
      email: user!.email,
      name: user!.name,
    },
    success: true,
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    let user = await userModel.findUserByCredentials(email, password);

    const accessToken = jwt.sign({ _id: user._id }, accessTokenSecretKey, {
      expiresIn: accessTokenLifetime,
    });
    const refreshToken = jwt.sign({ _id: user._id }, refreshTokenSecretKey, {
      expiresIn: refreshTokenLifetime,
    });

    user.tokens.push({ token: refreshToken });

    user = await user.save();

    res.cookie('REFRESH_TOKEN', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: timeToMilliseconds(refreshTokenLifetime),
    });

    return res.send({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    let user = await userModel.create({
      name,
      email,
      password: hash,
    });

    const accessToken = jwt.sign({ _id: user._id }, accessTokenSecretKey, {
      expiresIn: accessTokenLifetime,
    });
    const refreshToken = jwt.sign({ _id: user._id }, refreshTokenSecretKey, {
      expiresIn: refreshTokenLifetime,
    });

    user.tokens.push({ token: refreshToken });

    user = await user.save();

    res.cookie('REFRESH_TOKEN', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: timeToMilliseconds(refreshTokenLifetime),
    });

    return res.status(201).send({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
      accessToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(error.message));
      }
      if ((error as any).code === 11000) {
        return next(new ConflictError(error.message));
      }
    }

    return next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies.REFRESH_TOKEN;

  if (!refreshToken) {
    return next(new BadRequestError('Неверные данные'));
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, refreshTokenSecretKey);
  } catch (error) {
    return next(new BadRequestError('Неверные данные'));
  }

  let user;

  try {
    user = await userModel.findById(payload).select('+tokens');
  } catch (error) {
    return next(error);
  }

  if (!user) {
    return next(new NotFoundError('Пользователь не найден'));
  }

  user.tokens = [];
  user = await user.save();

  const expiredRefreshToken = jwt.sign(
    { _id: user._id },
    refreshTokenSecretKey,
    { expiresIn: 0 },
  );

  res.cookie('REFRESH_TOKEN', expiredRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
  });

  return res.send({
    success: true,
  });
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let refreshToken = req.cookies.REFRESH_TOKEN;

  if (!refreshToken) {
    return next(new BadRequestError('Неверные данные'));
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, refreshTokenSecretKey);
  } catch (error) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let user;

  try {
    user = await userModel.findById(payload).select('+tokens');
  } catch (error) {
    return next(error);
  }

  if (!user) {
    return next(new NotFoundError('Пользователь не найден'));
  }

  const accessToken = jwt.sign({ _id: user._id }, accessTokenSecretKey, {
    expiresIn: accessTokenLifetime,
  });
  refreshToken = jwt.sign({ _id: user._id }, refreshTokenSecretKey, {
    expiresIn: refreshTokenLifetime,
  });

  user.tokens.push({ token: refreshToken });

  user = await user.save();

  res.cookie('REFRESH_TOKEN', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: timeToMilliseconds(refreshTokenLifetime),
  });

  return res.send({
    user: {
      email: user.email,
      name: user.name,
    },
    success: true,
    accessToken,
  });
};
