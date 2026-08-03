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

  if (endPage < openSession.startPage) {
    throw createHttpError(400, 'End page cannot be less than start page');
  }

  const finalPage = Math.min(endPage, libraryBook.totalPages);

  await prisma.readingSession.update({
    where: { id: openSession.id },
    data: {
      endPage: finalPage,
      finishedAt: new Date(),
    },
  });

  const newStatus =
    finalPage >= libraryBook.totalPages
      ? ReadingStatus.FINISHED
      : ReadingStatus.READING;

  await prisma.libraryBook.update({
    where: { id: bookId },
    data: {
      currentPage: finalPage,
      status: newStatus,
    },
  });
};
