import type { Request, Response } from 'express';
import { getAllBooks, getBookById } from '../services/books.js';

export const getBooksController = async (req: Request, res: Response) => {
  const books = await getAllBooks();

  res.status(200).json(books);
};

type BookParams = {
  bookId: string;
};

export const getBookByIdController = async (
  req: Request<BookParams>,
  res: Response,
) => {
  const { bookId } = req.params;

  const book = await getBookById(bookId);

  res.status(200).json(book);
};
