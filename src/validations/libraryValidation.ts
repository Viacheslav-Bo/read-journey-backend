import { z } from 'zod';
import { ReadingStatus } from '@prisma/client';

export const getBooksSchema = z.object({
  status: z.nativeEnum(ReadingStatus).optional(),
});

export const addBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  totalPages: z.number().int().positive().max(25000),
});

export const idParamSchema = z.object({
  id: z.string(),
});
