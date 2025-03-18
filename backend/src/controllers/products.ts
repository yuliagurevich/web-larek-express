import { Request, Response, NextFunction } from "express";
import { Error } from "mongoose";
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
export const createProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return Product.create({
    title: req.body.title,
    image: req.body.image,
    category: req.body.category,
    description: req.body.description,
    price: req.body.price || null,
  })
    .then((product) => res.status(201).send(product))
    .catch((error: Error) => {
      if (error instanceof Error.ValidationError) {
        console.log(error);
        return next(new BadRequestError(error.message));
      }
      if (error.name  === "MongoServerError" && error.message.includes("E11000") && error.message.includes("title")) {
        return next(new ConflictError(productErrorMessages.title.unique));
      }
    });
};

export const findProductById = (id: string) => {
  return Product.findById(id);
};
