import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import userModel from '../models/user';
import { accessTokenSecretKey, refreshTokenSecretKey, accessTokenLifetime, refreshTokenLifetime } from "../config";
import { timeToMilliseconds } from '../utils/timeUtils';

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
        return next(new Error('На сервере произошла ошибка'));
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

        // Генерируем пару accessToken и refreshToken
        const accessToken = jwt.sign({ _id: user._id }, accessTokenSecretKey, { expiresIn: accessTokenLifetime });
        const refreshToken = jwt.sign({ _id: user._id }, refreshTokenSecretKey, { expiresIn: refreshTokenLifetime });

        // Дописываем в документ токены для этого пользователя
        user.tokens.push({ token: accessToken });
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

export const logout = (req: Request, res: Response, next: NextFunction) => {
    // Получает токен пользователя
    // Удаляет из базы рефреш-токен
    // Если _id полученный по токену невалиден 400
    // Если _id пользователь не найден 404

}

export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
    // принимает refresh-токен из cookies
    // возвращает новую пару токенов и пользователя
    // Если переданный токен просрочен или невалиден, контроллер возвращает ошибку 401.
}