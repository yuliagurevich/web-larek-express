import { Request, Response, NextFunction } from "express";
import { Error } from "mongoose";
import path from "path";
import fs from "fs";
import { uploadPathTemp, uploadPath } from "../config";
import Product, { IProduct } from "../models/products";
import BadRequestError from "../errors/bad-reqest-error";
import ConflictError from "../errors/conflict-error";
import { productErrorMessages } from "../middlewares/error-messages";

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return Product.find({}).then((products: IProduct[]) =>
    res.send({
      items: products,
      total: products.length,
    })
  );
};

// TODO Обработать поле image
// TODO Обработать ошибку текстом "Ошибка валидации данных при создании товара"
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { image, title, category, description, price } = req.body;
  // Перенести файл картинки из временной папки в постоянную
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
        console.log(error);
        return next(new BadRequestError(error.message));
      }
      if (
        error.name === "MongoServerError" &&
        error.message.includes("E11000") &&
        error.message.includes("title")
      ) {
        return next(new ConflictError(productErrorMessages.title.unique));
      }
    });
};

export const findProductById = (id: string) => {
  return Product.findById(id);
};

export const uploadProductImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("File: ", req);
  if (!req.file) {
    return res.status(400).json({ message: "Файл не загружен" });
  }
  res.send({
    fileName: `/images/${req.file?.filename}`,
    originalName: req.file?.originalname,
  });
};
