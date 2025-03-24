import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';

import { ICreateOrder } from '../middlewares/validations';
import Product from '../models/products';
import BadRequestError from '../errors/bad-reqest-error';

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const orderData: ICreateOrder = req.body;

  const ids = orderData.items;

  try {
    const products = await Product.find({ _id: { $in: ids } });

    if (products.length !== ids.length) {
      return next(
        new BadRequestError('Список товаров содержит невалидный идентификатор'),
      );
    }

    if (products.some((product) => product.price === null)) {
      return next(new BadRequestError('Один или более товаров не продаются'));
    }

    const calculatedTotal = products.reduce((acc, product) => acc + product.price!, 0);

    if (calculatedTotal !== orderData.total) {
      return next(
        new BadRequestError(
          'Суммарная стоимость товаров не соответствует указанной сумме заказа',
        ),
      );
    }
  } catch (error) {
    return next(error);
  }

  return res.status(200).send({
    id: faker.string.uuid(),
    total: orderData.total,
  });
};

export default createOrder;
