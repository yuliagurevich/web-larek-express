import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products';
import auth from '../middlewares/auth';
import {
  validateCreateProductBody,
  validateUpdateProductBody,
  validateProductId,
} from '../middlewares/validations';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateCreateProductBody, createProduct);
router.patch(
  '/:productId',
  auth,
  validateProductId,
  validateUpdateProductBody,
  updateProduct,
);
router.delete('/:productId', auth, validateProductId, deleteProduct);

export default router;
