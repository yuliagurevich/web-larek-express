import { Request, Response, NextFunction } from 'express';
import { ICreateOrder } from 'middlewares/validations';
import { faker } from '@faker-js/faker';

export const createOrder = (req: Request, res: Response, next: NextFunction) => {
    const orderData: ICreateOrder = req.body;

    console.log(req.body);

    return res.status(200).send({
        id: faker.string.uuid(),
        total: orderData.total
    });
}