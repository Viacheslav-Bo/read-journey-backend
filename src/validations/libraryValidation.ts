import Joi from 'joi';

export const addToLibrarySchema = Joi.object({
  bookId: Joi.string().uuid().required(),
});

export const removeFromLibrarySchema = Joi.object({
  bookId: Joi.string().uuid().required(),
});
