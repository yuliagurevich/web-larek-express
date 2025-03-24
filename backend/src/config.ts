import 'dotenv/config';
import os from 'os';
import path from 'path';

export const port = process.env.PORT || 3001;
export const corsOrigin = process.env.ORIGIN_ALLOW || 'http://localhost:5173';
export const dbAddress = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';
export const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY || 'access_token_secret_key';
export const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY || 'refresh_token_secret_key';
export const accessTokenLifetime = process.env.AUTH_ACCESS_TOKEN_EXPIRY || '1m';
export const refreshTokenLifetime = process.env.AUTH_REFRESH_TOKEN_EXPIRY || '1m';
export const uploadPathTemp = path.join(__dirname, process.env.UPLOAD_PATH_TEMP || 'temp') || os.tmpdir();
export const uploadPath = path.join(__dirname, 'public', process.env.UPLOAD_PATH || 'images');
