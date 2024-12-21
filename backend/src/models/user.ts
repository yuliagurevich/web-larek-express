import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

import BadRequestError from '../errors/bad-reqest-error';

interface IToken {
    token: string;
}

interface IUser {
    name: string;
    email: string;
    password: string;
    tokens: IToken[];
}

interface IUserModel extends mongoose.Model<IUser> {
    findUserByCredentials: (email: string, password: string) => Promise<mongoose.HydratedDocument<IUser>>
}

const tockenSchema = new Schema<IToken>({
    token: {
        type: String
    }
}, {
    versionKey: false
})

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 30,
        default: 'Ё-мое'
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        min: 6,
        required: true,
        select: false
    },
    tokens: [
        tockenSchema
    ]
}, {
    versionKey: false
});

userSchema.statics
    .findUserByCredentials = async function findUserByCredentials(email: string, password: string) {
        try {
            // Ищем пользователя с переданным email в БД
            const user = await this.findOne({ email }).select('+password');
            // Пользователь с указанным email найден - сравниваем переданный пароль с сохраненным в БД
            const match = await bcrypt.compare(password, user.password);
            // Если переданный пароль не совпадает с сохраненным в БД, передаем ошибку 400 (неверные данные)
            if (!match) {
                return Promise.reject(new BadRequestError('Неправильная почта или пароль'));
            }
            // Пароль совпадает с сохраненным в БД, возвращаем данные пользователя
            return user;
        } catch (error) {
            // Если пользователь с переданным email не зарегистрирован, передаем ошибку 400 (неверные данные)
            return Promise.reject(new BadRequestError('Неправильная почта или пароль'));
        }
    }

export default mongoose.model<IUser, IUserModel>('user', userSchema);