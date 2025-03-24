import { celebrate, Joi, Segments } from 'celebrate';
import {
  productErrorMessages,
  orderErrorMessages,
  userErrorMessages,
} from './error-messages';

const createProductSchema = Joi.object({
  description: Joi.string().allow('').messages({
    'string.base': productErrorMessages.description.type,
  }),
  image: Joi.object({
    fileName: Joi.string().required().messages({
      'string.base': productErrorMessages.image.fileName.type,
      'string.empty': productErrorMessages.image.fileName.empty,
      'any.required': productErrorMessages.image.fileName.required,
    }),
    originalName: Joi.string().required().messages({
      'string.base': productErrorMessages.image.originalName.type,
      'string.empty': productErrorMessages.image.originalName.empty,
      'any.required': productErrorMessages.image.originalName.required,
    }),
  }),
  title: Joi.string().min(2).max(30).required()
    .messages({
      'string.base': productErrorMessages.title.type,
      'string.empty': productErrorMessages.title.empty,
      'string.min': productErrorMessages.title.min,
      'string.max': productErrorMessages.title.max,
      'any.required': productErrorMessages.title.required,
    }),
  category: Joi.string().required().messages({
    'string.base': productErrorMessages.category.type,
    'string.empty': productErrorMessages.category.empty,
    'any.required': productErrorMessages.category.required,
  }),
  price: Joi.number().allow(null).messages({
    'number.base': productErrorMessages.price.type,
  }),
});

export const validateCreateProductBody = celebrate({
  [Segments.BODY]: createProductSchema,
});

enum Payment {
  Card = 'card',
  Online = 'online',
}

export interface ICreateOrder {
  items: string[];
  total: number;
  payment: Payment;
  email: string;
  phone: string;
  address: string;
}

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.string().required().messages({
        'string.base': orderErrorMessages.items.item.type,
        'string.empty': orderErrorMessages.items.item.empty,
        'any.required': orderErrorMessages.items.item.required,
      }),
    )
    .min(1)
    .required()
    .messages({
      'array.base': orderErrorMessages.items.type,
      'array.min': orderErrorMessages.items.min,
      'any.required': orderErrorMessages.items.required,
    }),
  total: Joi.number().required().messages({
    'number.base': orderErrorMessages.total.type,
    'any.required': orderErrorMessages.total.required,
  }),
  payment: Joi.string()
    .valid(Payment.Card, Payment.Online)
    .required()
    .messages({
      'string.base': orderErrorMessages.payment.type,
      'string.empty': orderErrorMessages.payment.empty,
      'any.only': orderErrorMessages.payment.invalid,
      'any.required': orderErrorMessages.payment.required,
    }),
  email: Joi.string().email().required().messages({
    'string.base': orderErrorMessages.email.type,
    'string.empty': orderErrorMessages.email.empty,
    'string.email': orderErrorMessages.email.invalid,
    'any.requred': orderErrorMessages.email.required,
  }),
  phone: Joi.string().required().messages({
    'string.base': orderErrorMessages.phone.type,
    'string.empty': orderErrorMessages.phone.empty,
    'any.required': orderErrorMessages.phone.required,
  }),
  address: Joi.string().required().messages({
    'string.base': orderErrorMessages.address.type,
    'string.empty': orderErrorMessages.address.empty,
    'any.required': orderErrorMessages.address.required,
  }),
});

export const validateCreateOrderBody = celebrate({
  [Segments.BODY]: createOrderSchema,
});

const registerUserSchema = Joi.object({
  name: Joi.string().min(2).max(30).messages({
    'string.base': userErrorMessages.name.type,
    'string.empty': userErrorMessages.name.empty,
    'string.min': userErrorMessages.name.min,
    'string.max': userErrorMessages.name.max,
  }),
  email: Joi.string().email().required().messages({
    'string.base': userErrorMessages.email.type,
    'string.empty': userErrorMessages.email.empty,
    'string.email': userErrorMessages.email.invalid,
    'any.requred': userErrorMessages.email.required,
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': userErrorMessages.password.type,
    'string.empty': userErrorMessages.password.empty,
    'string.min': userErrorMessages.password.min,
    'any.requred': userErrorMessages.password.required,
  }),
});

export const validateRegisterUserBody = celebrate({
  [Segments.BODY]: registerUserSchema,
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': userErrorMessages.email.type,
    'string.empty': userErrorMessages.email.empty,
    'string.email': userErrorMessages.email.invalid,
    'any.requred': userErrorMessages.email.required,
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': userErrorMessages.password.type,
    'string.empty': userErrorMessages.password.empty,
    'string.min': userErrorMessages.password.min,
    'any.requred': userErrorMessages.password.required,
  }),
});

export const validateLoginUserBody = celebrate({
  [Segments.BODY]: loginUserSchema,
});

export const validateProductId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
});

const updateProductSchema = Joi.object({
  description: Joi.string().allow('').messages({
    'string.base': productErrorMessages.description.type,
  }),
  image: Joi.object({
    fileName: Joi.string().messages({
      'string.base': productErrorMessages.image.fileName.type,
      'string.empty': productErrorMessages.image.fileName.empty,
    }),
    originalName: Joi.string().messages({
      'string.base': productErrorMessages.image.originalName.type,
      'string.empty': productErrorMessages.image.originalName.empty,
    }),
  }),
  title: Joi.string().min(2).max(30).messages({
    'string.base': productErrorMessages.title.type,
    'string.empty': productErrorMessages.title.empty,
    'string.min': productErrorMessages.title.min,
    'string.max': productErrorMessages.title.max,
  }),
  category: Joi.string().messages({
    'string.base': productErrorMessages.category.type,
    'string.empty': productErrorMessages.category.empty,
  }),
  price: Joi.number().allow(null).messages({
    'number.base': productErrorMessages.price.type,
  }),
});

export const validateUpdateProductBody = celebrate({
  [Segments.BODY]: updateProductSchema,
});
