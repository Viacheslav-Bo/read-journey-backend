import createHttpError from 'http-errors';
import prisma from '../../prisma/client.js';
import { ReadingStatus } from '@prisma/client';

export const deleteReadingSession = async (
  userId: string,
  libraryBookId: string,
  sessionId: string,
) => {
  const libraryBook = await prisma.libraryBook.findFirst({
    where: {
      id: libraryBookId,
      userId,
    },
  });

  if (!libraryBook) {
    throw createHttpError(404, 'Book not found');
  }

  await prisma.readingSession.delete({
    where: {
      id: sessionId,
    },
  });

  const lastSession = await prisma.readingSession.findFirst({
    where: {
      libraryBookId,
    },
    orderBy: {
      startedAt: 'desc',
    },
  });

  if (!lastSession) {
    await prisma.libraryBook.update({
      where: {
        id: libraryBookId,
      },
      data: {
        currentPage: 1,
        status: ReadingStatus.UNREAD,
      },
    });

    return;
  }

  const currentPage = lastSession.endPage ?? lastSession.startPage;

  const status =
    lastSession.endPage === libraryBook.totalPages
      ? ReadingStatus.FINISHED
      : ReadingStatus.READING;

  await prisma.libraryBook.update({
    where: {
      id: libraryBookId,
    },
    data: {
      currentPage,
      status,
    },
  });
};
