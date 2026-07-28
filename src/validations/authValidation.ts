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
