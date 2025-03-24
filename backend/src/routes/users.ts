import { Router } from 'express';
import { validateLoginUserBody, validateRegisterUserBody } from '../middlewares/validations';
import {
  getCurrentUser, register, login, refreshAccessToken, logout,
} from '../controllers/auth';
import auth from '../middlewares/auth';

const router = Router();

router.get('/user', auth, getCurrentUser);
router.post('/register', validateRegisterUserBody, register);
router.post('/login', validateLoginUserBody, login);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);

export default router;
