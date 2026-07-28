import createHttpError from 'http-errors';
import prisma from '../../prisma/client.js';
import { ReadingStatus } from '@prisma/client';

export const stop = async (userId: string, bookId: string, endPage: number) => {
  const libraryBook = await prisma.libraryBook.findFirst({
    where: { id: bookId, userId },
  });

  if (!libraryBook) {
    throw createHttpError(404, 'Book not found');
  }

  const openSession = await prisma.readingSession.findFirst({
    where: { libraryBookId: bookId, endPage: null },
  });

  if (!openSession) {
    throw createHttpError(404, 'No active reading session found');
  }

  await prisma.readingSession.update({
    where: { id: openSession.id },
    data: { endPage, finishedAt: new Date() },
  });

  const newStatus =
    endPage === libraryBook.totalPages
      ? ReadingStatus.FINISHED
      : ReadingStatus.READING;

  await prisma.libraryBook.update({
    where: { id: bookId },
    data: {
      currentPage: endPage,
      status: newStatus,
    },
  });
};
