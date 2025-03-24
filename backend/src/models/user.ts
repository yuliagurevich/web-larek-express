import mongoose, { Schema } from 'mongoose';
import { Request } from 'express';
import bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';

import { userErrorMessages } from '../middlewares/error-messages';
import UnauthorizedError from '../errors/unauthorized-error';

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
  userId?: string | JwtPayload;
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
  },
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      min: [2, userErrorMessages.name.min],
      max: [30, userErrorMessages.name.max],
      default: 'Ё-мое',
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
    },

  },
  {
    versionKey: false,
  },
);

userSchema.static(
  'findUserByCredentials',
  async function findUserByCredentials(email: string, password: string) {
    try {
      const user = await this.findOne({ email }).select('+password').select('+tokens');
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return Promise.reject(
          new UnauthorizedError('Неверная почта или пароль'),
        );
      }
      return Promise.resolve(user);
    } catch (error) {
      return Promise.reject(
        new UnauthorizedError('Неверная почта или пароль'),
      );
    }
  },
);

export default mongoose.model<IUser, IUserModel>('user', userSchema);
