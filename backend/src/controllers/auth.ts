import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import userModel from '../models/user';
import { accessTokenSecretKey, refreshTokenSecretKey, accessTokenLifetime, refreshTokenLifetime } from "../config";
import { timeToMilliseconds } from '../utils/timeUtils';
import NotFoundError from "../errors/not-found-error";
import BadRequestError from "../errors/bad-reqest-error";

export const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
    // Получить access-токен из заголовка authorization
    // Получить данные пользователя из токена
    // Ответ:
    /* {
        "user": {
            "email": "admin@ya.ru",
            "name": "Максим"
        },
        "success": true,
    } */
    // Если пользователь не найден, контроллер должен вернуть ошибку 404
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        // Ищем пользователя с переданным email в БД
        const user = await userModel.findUserByCredentials(email, password);

        // Аутентификация успешна - генерируем пару accessToken и refreshToken,
        const accessToken = jwt.sign({ _id: user._id }, accessTokenSecretKey, { expiresIn: accessTokenLifetime });
        const refreshToken = jwt.sign({ _id: user._id }, refreshTokenSecretKey, { expiresIn: refreshTokenLifetime });

        // Дописываем в документ токен для этого пользователя
        user.tokens.push({ token: refreshToken });

        // Сохраняем документ в БД
        user.save();

        // refreshToken передаем в cookie
        res.cookie("REFRESH_TOKEN", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: timeToMilliseconds(refreshTokenLifetime),
        })

        // accessToken передаем в теле ответа
        res.send({
            user: {
                email: user.email,
                name: user.name
            },
            success: true,
            accessToken
        });
    } catch (error) {
        // Ошибка на сервере
        return next(error);
    }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    console.log("Тут был админ");

    // Невалидные почта или пароль ошибка 400
    // Дублирующийся email 409
    try {
        // Извлекаем данные из тела запроса
        const { name, email, password } = req.body;

        // Хешируем пароль с солью
        const hash = await bcrypt.hash(password, 10);

        // Отправляем запрос на сохранение пользователя в БД
        const user = await userModel.create({
            name,
            email,
            password: hash
        });

        // Генерируем пару accessToken и refreshToken на основе _id пользователя
        const accessToken = jwt.sign({ _id: user._id }, accessTokenSecretKey, { expiresIn: accessTokenLifetime });
        const refreshToken = jwt.sign({ _id: user._id }, refreshTokenSecretKey, { expiresIn: refreshTokenLifetime });

        // Дописываем в документ токен для этого пользователя
        user.tokens.push({ token: refreshToken });

        // Сохраняем документ в БД
        user.save();

        // refreshToken передаем в cookie
        res.cookie("REFRESH_TOKEN", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: timeToMilliseconds(refreshTokenLifetime),
        })

        // accessToken передаем в теле ответа
        res.send({
            user: {
                email: user.email,
                name: user.name
            },
            success: true,
            accessToken
        });
    } catch (error) {
        // Ошибка на сервере
        return next(error);
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    // Получает токен пользователя из заголовка
    const refreshToken = req.cookies.REFRESH_TOKEN;
    console.log('refreshToken: ', refreshToken);

    if (!refreshToken) {
        console.log('Технически не передали токен, но мы не скажем');
        return next(new BadRequestError('Технически не передали токен, но мы не скажем'));
    }
    
    let payload;
    
    try {
        payload = jwt.verify(refreshToken, refreshTokenSecretKey);
        console.log('token payload: ', payload);
    } catch (error) {
        // Если _id полученный по токену невалиден 400
        console.log('Технически это какой-то не такой токен, но мы без подробностей');
        return next(new BadRequestError('Технически это какой-то не такой токен, но мы без подробностей'));
    }
    
    let user;
    
    try {
        user = await userModel.findById(payload);
        console.log('user:', user);
    } catch (error) {
        console.log('Ошибка БД, но мы про это не рассказываем');
        return next(new Error('Ошибка БД, но мы про это не рассказываем'))
    }
    
    if (!user) {
        // Если _id пользователь не найден 404
        console.log('Технически по токену не нашли пользователя, и не нужно это афишировать');
        return next(new NotFoundError('Технически по токену не нашли пользователя, и не нужно это афишировать'));
    }

    // Удаляет из базы рефреш-токен
    user.tokens = [];
    user.save();

    // Выпускаем просроченный refreshToken
    const expiredRefreshToken = jwt.sign({ _id: user._id }, refreshTokenSecretKey, { expiresIn: 0 });

    res.cookie("REFRESH_TOKEN", expiredRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 0,
    })

    res.send({
        success: true
    });
}

export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
    // принимает refresh-токен из cookies
    // возвращает новую пару токенов и пользователя
    // Если переданный токен просрочен или невалиден, контроллер возвращает ошибку 401.
}