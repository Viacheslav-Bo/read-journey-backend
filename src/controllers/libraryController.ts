import type { Request, Response } from 'express';
import type { z } from 'zod';
import { addBookToLibrary } from '../services/library/addBook.js';
import {
  addBookSchema,
  getBooksSchema,
  idParamSchema,
} from '../validations/libraryValidation.js';
import createHttpError from 'http-errors';
import { getBooksFromLibrary } from '../services/library/getBooks.js';
import { deleteBookFromLibrary } from '../services/library/deleteBook.js';
import { getBookById } from '../services/library/getBookById.js';

export const addBook = async (req: Request, res: Response) => {
  if (!req.user) throw createHttpError(401, 'Unauthorized');
  const { userId } = req.user;

  const data = req.validatedBody as z.infer<typeof addBookSchema>;
  const result = await addBookToLibrary(userId, data);
  res.status(201).json(result);
};

export const getBooks = async (req: Request, res: Response) => {
  if (!req.user) throw createHttpError(401, 'Unauthorized');
  const user = req.user;

  const { status } = req.validatedQuery as z.infer<typeof getBooksSchema>;
  const result = await getBooksFromLibrary(user.userId, status);
  res.status(200).json(result);
};

export const getOneBook = async (req: Request, res: Response) => {
  if (!req.user) throw createHttpError(401, 'Unauthorized');
  const { userId } = req.user;
  const { id } = req.validatedParams as z.infer<typeof idParamSchema>;

  const book = await getBookById(userId, id);
  res.status(200).json(book);
};

export const deleteBook = async (req: Request, res: Response) => {
  if (!req.user) throw createHttpError(401, 'Unauthorized');
  const user = req.user;
  const { id: bookId } = req.validatedParams as z.infer<typeof idParamSchema>;

  await deleteBookFromLibrary(user.userId, bookId);
  res.status(200).json({ message: 'Book removed' });
};
