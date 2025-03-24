import { Request, Response, NextFunction } from 'express';
import { Error, QueryOptions } from 'mongoose';
import path from 'path';
import fs from 'fs';
import { uploadPathTemp, uploadPath } from '../config';
import Product, { IProduct } from '../models/products';
import BadRequestError from '../errors/bad-reqest-error';
import ConflictError from '../errors/conflict-error';
import { productErrorMessages } from '../middlewares/error-messages';

export const getProducts = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => Product.find({}).then((products: IProduct[]) => res.send({
  items: products,
  total: products.length,
})).catch((error) => next(error));

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    image, title, category, description, price,
  } = req.body;

  const tempPath = path.join(uploadPathTemp, path.basename(image.fileName));
  const permPath = path.join(uploadPath, path.basename(image.fileName));

  try {
    await fs.promises.rename(tempPath, permPath);
  } catch (error) {
    next(error);
  }

  return Product.create({
    title,
    image,
    category,
    description,
    price: price || null,
  })
    .then((product) => res.status(201).send(product))
    .catch((error: Error) => {
      if (error instanceof Error.ValidationError) {
        return next(new BadRequestError(error.message));
      }
      if (
        error.name === 'MongoServerError'
        && error.message.includes('E11000')
        && error.message.includes('title')
      ) {
        return next(new ConflictError(productErrorMessages.title.unique));
      }
      return next(error);
    });
};

export const uploadProductImage = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }

  return res.send({
    fileName: `/images/${req.file?.filename}`,
    originalName: req.file?.originalname,
  });
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { productId } = req.params;
  const product = req.body;

  if (product.image) {
    const tempPath = path.join(
      uploadPathTemp,
      path.basename(product.image.fileName),
    );
    const permPath = path.join(
      uploadPath,
      path.basename(product.image.fileName),
    );

    try {
      await fs.promises.rename(tempPath, permPath);
    } catch (error) {
      next(error);
    }
  }

  const options: QueryOptions = {
    returnDocument: 'after',
    runValidators: true,
  };

  return Product.findByIdAndUpdate(productId, product, options)
    .then((updatedProduct) => res.status(200).send(updatedProduct))
    .catch((error: Error) => {
      if (error instanceof Error.ValidationError) {
        return next(new BadRequestError(error.message));
      }
      if (
        error.name === 'MongoServerError'
        && error.message.includes('E11000')
        && error.message.includes('title')
      ) {
        return next(new ConflictError(productErrorMessages.title.unique));
      }

      return next(error);
    });
};

export const deleteProduct = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { productId } = req.params;
  return Product.deleteOne({ _id: productId })
    .then((result) => res.status(200).send(result))
    .catch((error) => {
      if (error instanceof Error.ValidationError) {
        return next(new BadRequestError(error.message));
      }

      return next(error);
    });
};
