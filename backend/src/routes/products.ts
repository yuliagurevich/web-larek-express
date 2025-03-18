import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/products';
import { validateCreateProductBody } from '../middlewares/validations';

const router = Router();

router.get('/', getProducts);
router.post('/',validateCreateProductBody, createProduct);

export default router;