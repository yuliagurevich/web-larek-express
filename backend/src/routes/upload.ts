import { Router } from "express";
import { fileMiddleware } from '../middlewares/file';
import { uploadProductImage } from "../controllers/products";

const router = Router();

router.post("/", fileMiddleware.single("file"), uploadProductImage);

export default router;
