import { Request, Response, NextFunction } from 'express';
import Product, { IProduct } from '../models/products';

export const getProducts = (req: Request, res: Response, next: NextFunction) => {
    return Product.find({})
        .then((products: IProduct[]) => res.send({
            items: products,
            total: products.length
        }));        
}

// TODO Обработать поле image
// TODO Обработать ошибку текстом "Ошибка валидации данных при создании товара"
export const createProduct = (req: Request, res: Response, next: NextFunction) => {
    return Product.create({
        title: req.body.title,
        image: req.body.image,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price || null
    })
    .then(product => res.status(201).send(product));    
}

export const findProductById = (id: string) => {
    return Product.findById(id);
}