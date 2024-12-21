import { celebrate, Joi, Segments } from 'celebrate';
import { findProductById } from '../controllers/products';

export interface ICreateOrder {
    items: string[];
    total: number;
    payment: string;
    email: string;
    phone: string;
    address: string;
}

const validateOrderItems = (items: string[], helpers: any) => {
    console.log(items);
    // TODO Сходить в базу и убедиться, что _id существуют и цена на них не null
    items.map(async (id: string) => {
        const product = await findProductById(id)
    })
}

const validateOrderTotal = async (total: number, helpers: any) => {
    const { items } = helpers.state.ancestors[0];
    console.log(total);

    const totalFromItems = await Promise.all(
        items.map(async (id: string) => {
            const product = await findProductById(id);
            return product?.price;
        })
    ).then((prices) => prices.reduce((sum, price) => sum + price, 0));

    console.log(totalFromItems);

    if (total !== totalFromItems) {
        console.log(`Общая сумма (${total}) не соответствует стоимости переданных товаров (${totalFromItems}).`);
        return helpers.message(`Общая сумма (${total}) не соответствует стоимости переданных товаров (${totalFromItems}).`);
    }

    return total;
}

// TODO Добавить проверку в БД значений полей items и total
const createOrderSchema = Joi.object({
    items: Joi.array().items(Joi.string().required()).min(1).required(),
    total: Joi.number().required(),
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required()
});

export const validateCreateOrderBody = celebrate({
    [Segments.BODY]: createOrderSchema
});