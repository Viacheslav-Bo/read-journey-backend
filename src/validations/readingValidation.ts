import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string(),
});

export const stopReadingSchema = z.object({
  endPage: z.number().int().positive(),
});
