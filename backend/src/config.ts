import 'dotenv/config';

export const port = process.env.PORT || 3001;
export const dbAddress = process.env.DB_ADDRESS || '';
export const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY || 'access_token_secret_key';
export const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY || 'refresh_token_secret_key';
export const accessTokenLifetime = process.env.AUTH_ACCESS_TOKEN_EXPIRY || '1m';
export const refreshTokenLifetime = process.env.AUTH_REFRESH_TOKEN_EXPIRY || '1m';