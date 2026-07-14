import Joi from 'joi';

export const startReadingSchema = Joi.object({
  bookId: Joi.string().uuid().required(),

  page: Joi.number().integer().min(1).required(),
});

export const stopReadingSchema = Joi.object({
  bookId: Joi.string().uuid().required(),

  page: Joi.number().integer().min(1).required(),
});
