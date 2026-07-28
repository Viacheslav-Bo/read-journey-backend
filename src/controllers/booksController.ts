import type { Request, Response } from 'express';
import type { z } from 'zod';
import { fetchBooks } from '../services/books/fetchBooks.js';
import { booksQuerySchema } from '../validations/bookValidation.js';

export const getBooks = async (req: Request, res: Response) => {
  const { page, limit, title, author } = req.validatedQuery as z.infer<
    typeof booksQuerySchema
  >;
  const result = await fetchBooks(page, limit, title, author);
  res.status(200).json(result);
};
