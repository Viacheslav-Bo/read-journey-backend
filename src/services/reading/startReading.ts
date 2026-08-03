import createHttpError from 'http-errors';
import prisma from '../../prisma/client.js';
import { ReadingStatus } from '@prisma/client';

export const start = async (
  userId: string,
  bookId: string,
  startPage: number,
) => {
  const libraryBook = await prisma.libraryBook.findFirst({
    where: { id: bookId, userId },
  });

  if (!libraryBook) {
    throw createHttpError(404, 'Book not found');
  }

  if (startPage > libraryBook.totalPages) {
    throw createHttpError(400, 'Start page exceeds total pages');
  }

  if (libraryBook.status === ReadingStatus.FINISHED) {
    throw createHttpError(400, 'Book already finished');
  }

  const activeSession = await prisma.readingSession.findFirst({
    where: {
      libraryBookId: bookId,
      endPage: null,
    },
  });

  if (activeSession) {
    throw createHttpError(400, 'Reading session already started');
  }

  await prisma.readingSession.create({
    data: {
      libraryBookId: bookId,
      startPage,
      startedAt: new Date(),
    },
  });

  await prisma.libraryBook.update({
    where: { id: bookId },
    data: {
      currentPage: startPage,
      status: ReadingStatus.READING,
    },
  });
};
