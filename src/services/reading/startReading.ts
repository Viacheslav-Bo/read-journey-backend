import createHttpError from 'http-errors';
import prisma from '../../prisma/client.js';
import { ReadingStatus } from '@prisma/client';

export const start = async (userId: string, bookId: string) => {
  const libraryBook = await prisma.libraryBook.findFirst({
    where: { id: bookId, userId },
  });

  if (!libraryBook) {
    throw createHttpError(404, 'Book not found');
  }

  await prisma.readingSession.create({
    data: {
      libraryBookId: bookId,
      startPage: libraryBook.currentPage,
      startedAt: new Date(),
    },
  });

  await prisma.libraryBook.update({
    where: { id: bookId },
    data: { status: ReadingStatus.READING },
  });
};
