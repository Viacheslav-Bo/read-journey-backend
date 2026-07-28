import createHttpError from 'http-errors';
import prisma from '../../prisma/client.js';

export const getReadingSessions = async (
  userId: string,
  libraryBookId: string,
) => {
  const libraryBook = await prisma.libraryBook.findFirst({
    where: { id: libraryBookId, userId },
  });

  if (!libraryBook) {
    throw createHttpError(404, 'Book not found');
  }

  const allSessions = await prisma.readingSession.findMany({
    where: { libraryBookId: libraryBookId },
    orderBy: { startedAt: 'asc' },
  });

  return allSessions;
};
