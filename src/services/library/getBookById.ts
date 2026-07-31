import prisma from '../../prisma/client.js';
import createHttpError from 'http-errors';

export const getBookById = async (userId: string, bookId: string) => {
  const book = await prisma.libraryBook.findFirst({
    where: { id: bookId, userId },
  });
  if (!book) {
    throw createHttpError(404, 'Book not found');
  }
  return book;
};
