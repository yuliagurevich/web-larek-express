import { Router } from 'express';
import { validateCreateOrderBody } from '../middlewares/validations';
import { getCurrentUser, register, login, refreshAccessToken, logout } from '../controllers/auth';

const router = Router();

// router.post('/user', getCurrentUser);
router.post('/register', register);
router.post('/login', login);
// router.post('/token', refreshAccessToken);
// router.post('/logout', logout);

export default router;