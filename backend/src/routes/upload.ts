import { Router } from 'express';
import { fileMiddleware } from '../middlewares/file';
import auth from '../middlewares/auth';
import { uploadProductImage } from '../controllers/products';

const router = Router();

router.post('/', auth, fileMiddleware.single('file'), uploadProductImage);

export default router;
