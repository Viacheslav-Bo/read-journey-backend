import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().min(2).max(20),

  email: z.string().trim().lowercase().email(),

  password: z.string().min(8).max(64),
});

export const loginUserSchema = z.object({
  email: z.string().trim().lowercase().email(),

  password: z.string().min(8).max(64),
});

// export const requestResetEmailSchema = Joi.object({
//   email: Joi.string().trim().lowercase().email().required(),
// });

// export const resetPasswordSchema = Joi.object({
//   password: Joi.string().min(8).required(),

//   token: Joi.string().required(),
// });
