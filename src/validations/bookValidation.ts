import Joi from 'joi';

export const getBooksQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),

  perPage: Joi.number().integer().min(1).max(20).default(10),

  title: Joi.string().trim().allow(''),

  author: Joi.string().trim().allow(''),
});

export const addBookSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),

  author: Joi.string().trim().min(1).max(255).required(),

  totalPages: Joi.number().integer().min(1).required(),
});
