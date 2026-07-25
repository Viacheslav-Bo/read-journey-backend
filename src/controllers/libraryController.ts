import type { Request, Response } from 'express';
import {
  getLibraryAllBooks,
  getLibraryBookById,
  addBookToLibrary,
} from '../services/library.js';

export const getLibraryBooksController = async (
  req: Request,
  res: Response,
) => {
  const books = await getLibraryAllBooks();

  res.status(200).json(books);
};

type BookParams = {
  bookId: string;
};

export const getLibraryBookByIdController = async (
  req: Request<BookParams>,
  res: Response,
) => {
  const { bookId } = req.params;

  const book = await getLibraryBookById(bookId);

  res.status(200).json(book);
};

type AddBookBody = {
  openLibraryId: string;
  title: string;
  author: string;
  coverUrl?: string;
  totalPages: number;
};

export const addBookToLibraryController = async (
  req: Request<{}, {}, AddBookBody>,
  res: Response,
) => {
  const book = await addBookToLibrary('тестовий-id', req.body);

  res.status(201).json(book);
};
