import mongoose, { Schema } from "mongoose";
import { Request } from "express";
import bcrypt from "bcrypt";

import { userErrorMessages } from "../middlewares/error-messages";
import UnauthorizedError from "../errors/unauthorized-error";

interface IToken {
  token: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: IToken[];
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

interface IUserModel extends mongoose.Model<IUser> {
  findUserByCredentials: (
    email: string,
    password: string
  ) => Promise<mongoose.HydratedDocument<IUser>>;
}

const tockenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
    },
  },
  {
    versionKey: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      min: [2, userErrorMessages.name.min],
      max: [30, userErrorMessages.name.max],
      default: "Ё-мое",
    },
    email: {
      type: String,
      required: [true, userErrorMessages.email.required],
      unique: true,
    },
    password: {
      type: String,
      min: [6, userErrorMessages.password.min],
      required: [true, userErrorMessages.password.required],
      select: false,
    },
    tokens: {
      type: [tockenSchema],
      select: false,
    } 
    
  },
  {
    versionKey: false,
  }
);

/* userSchema.statics.findUserByCredentials = async function findUserByCredentials(
  email: string,
  password: string
) {
  try {
    // Ищем пользователя с переданным email в БД
    const user = await this.findOne({ email }).select("+password");
    // Пользователь с указанным email найден - сравниваем переданный пароль с сохраненным в БД
    const match = await bcrypt.compare(password, user.password);
    // Если переданный пароль не совпадает с сохраненным в БД, передаем ошибку 400 (неверные данные)
    if (!match) {
      return Promise.reject(
        new BadRequestError("Неправильная почта или пароль")
      );
    }
    // Пароль совпадает с сохраненным в БД, возвращаем данные пользователя
    return user;
  } catch (error) {
    // Если пользователь с переданным email не зарегистрирован, передаем ошибку 400 (неверные данные)
    return Promise.reject(new BadRequestError("Неправильная почта или пароль"));
  }
}; */

userSchema.static(
  "findUserByCredentials",
  async function findUserByCredentials(email: string, password: string) {
    try {
      // Ищем пользователя с переданным email в БД
      const user = await this.findOne({ email }).select("+password").select('+tokens');
      // Пользователь с указанным email найден - сравниваем переданный пароль с сохраненным в БД
      const match = await bcrypt.compare(password, user.password);
      // Если переданный пароль не совпадает с сохраненным в БД, передаем ошибку 401 (неверные данные)
      if (!match) {
        return Promise.reject(
          new UnauthorizedError("Неверная почта или пароль")
        );
      }
      // Пароль совпадает с сохраненным в БД, возвращаем данные пользователя
      return Promise.resolve(user);
    } catch (error) {
      // Если пользователь с переданным email не зарегистрирован, передаем ошибку 401 (неверные данные)
      return Promise.reject(
        new UnauthorizedError("Неверная почта или пароль")
      );
    }
  }
);

export default mongoose.model<IUser, IUserModel>("user", userSchema);
