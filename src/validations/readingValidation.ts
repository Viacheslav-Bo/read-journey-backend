import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string(),
});

export const startReadingSchema = z.object({
  startPage: z.number().int().positive(),
});

export const stopReadingSchema = z.object({
  endPage: z.number().int().positive(),
});

export const sessionParamSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
});
