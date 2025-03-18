import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import userModel from "../models/user";
import {
  accessTokenSecretKey,
  refreshTokenSecretKey,
  accessTokenLifetime,
  refreshTokenLifetime,
} from "../config";
import { timeToMilliseconds } from "../utils/timeUtils";
import NotFoundError from "../errors/not-found-error";
import BadRequestError from "../errors/bad-reqest-error";
import ConflictError from "../errors/conflict-error";
import UnauthorizedError from "../errors/unauthorized-error";

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Получить access-токен из заголовка authorization
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Необходима авторизация"));
  }

  const accessToken = authorization.replace("Bearer ", "");

  let payload;

  try {
    payload = jwt.verify(accessToken, accessTokenSecretKey);
  } catch (error) {
    // Если _id полученный по токену невалиден 400
    return next(new UnauthorizedError("Необходима авторизация"));
  }

  let user;

  try {
    user = await userModel.findById(payload);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    // Если _id пользователь не найден 404
    return next(new NotFoundError("Пользователь не найден"));
  }
  res.send({
    user: {
      email: user.email,
      name: user.name,
    },
    success: true,
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    // Ищем пользователя с переданным email в БД
    let user = await userModel.findUserByCredentials(email, password);

    console.log(user);

    // Аутентификация успешна - генерируем пару accessToken и refreshToken,
    const accessToken = jwt.sign({ _id: user._id }, accessTokenSecretKey, {
      expiresIn: accessTokenLifetime,
    });
    const refreshToken = jwt.sign({ _id: user._id }, refreshTokenSecretKey, {
      expiresIn: refreshTokenLifetime,
    });

    // Дописываем в документ токен для этого пользователя
    user.tokens.push({ token: refreshToken });

    // Сохраняем документ в БД
    user = await user.save();

    // refreshToken передаем в cookie
    res.cookie("REFRESH_TOKEN", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: timeToMilliseconds(refreshTokenLifetime),
    });

    // accessToken передаем в теле ответа
    res.status(200).send({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
      accessToken,
    });
  } catch (error) {
    // Ошибка на сервере
    return next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Извлекаем данные из тела запроса
    const { name, email, password } = req.body;

    // Хешируем пароль с солью
    const hash = await bcrypt.hash(password, 10);

    // Отправляем запрос на сохранение пользователя в БД
    let user = await userModel.create({
      name,
      email,
      password: hash,
    });

    // Генерируем пару accessToken и refreshToken на основе _id пользователя
    const accessToken = jwt.sign({ _id: user._id }, accessTokenSecretKey, {
      expiresIn: accessTokenLifetime,
    });
    const refreshToken = jwt.sign({ _id: user._id }, refreshTokenSecretKey, {
      expiresIn: refreshTokenLifetime,
    });

    // Дописываем в документ токен для этого пользователя
    user.tokens.push({ token: refreshToken });

    // Сохраняем документ в БД
    user = await user.save();

    // refreshToken передаем в cookie
    res.cookie("REFRESH_TOKEN", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: timeToMilliseconds(refreshTokenLifetime),
    });

    // accessToken передаем в теле ответа
    res.status(201).send({
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
  next: NextFunction
) => {
  // Получает токен пользователя из заголовка
  const refreshToken = req.cookies.REFRESH_TOKEN;

  if (!refreshToken) {
    return next(new BadRequestError("Неверные данные"));
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, refreshTokenSecretKey);
  } catch (error) {
    // Если _id полученный по токену невалиден 400
    return next(new BadRequestError("Неверные данные"));
  }

  let user;

  try {
    user = await userModel.findById(payload);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    // Если _id пользователь не найден 404
    return next(new NotFoundError("Пользователь не найден"));
  }

  // Удаляет из базы рефреш-токен
  user.tokens = [];
  user = await user.save();

  // Выпускаем просроченный refreshToken
  const expiredRefreshToken = jwt.sign(
    { _id: user._id },
    refreshTokenSecretKey,
    { expiresIn: 0 }
  );

  res.cookie("REFRESH_TOKEN", expiredRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
  });

  res.send({
    success: true,
  });
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Получает токен пользователя из заголовка
  let refreshToken = req.cookies.REFRESH_TOKEN;

  if (!refreshToken) {
    return next(new BadRequestError("Неверные данные"));
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, refreshTokenSecretKey);
  } catch (error) {
    // Если _id полученный по токену невалиден 401
    return next(new UnauthorizedError("Необходима авторизация"));
  }

  let user;

  try {
    user = await userModel.findById(payload);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    // Если _id пользователь не найден 404
    return next(new NotFoundError("Пользователь не найден"));
  }
  
  // Генерируем пару accessToken и refreshToken на основе _id пользователя
  const accessToken = jwt.sign({ _id: user._id }, accessTokenSecretKey, {
    expiresIn: accessTokenLifetime,
  });
  refreshToken = jwt.sign({ _id: user._id }, refreshTokenSecretKey, {
    expiresIn: refreshTokenLifetime,
  });

  // Дописываем в документ токен для этого пользователя
  user.tokens.push({ token: refreshToken });

  // Сохраняем документ в БД
  user = await user.save();

  // refreshToken передаем в cookie
  res.cookie("REFRESH_TOKEN", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: timeToMilliseconds(refreshTokenLifetime),
  });

  // accessToken передаем в теле ответа
  res.send({
    user: {
      email: user.email,
      name: user.name,
    },
    success: true,
    accessToken,
  });
};
