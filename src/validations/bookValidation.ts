import { z } from 'zod';

export const booksQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(20).default(20),
  title: z.string().optional(),
  author: z.string().optional(),
});
