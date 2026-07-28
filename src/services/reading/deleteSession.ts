import createHttpError from 'http-errors';
import prisma from '../../prisma/client.js';

export const deleteReadingSession = async (
  userId: string,
  libraryBookId: string,
  sessionId: string,
) => {
  const libraryBook = await prisma.libraryBook.findFirst({
    where: { id: libraryBookId, userId },
  });
  if (!libraryBook) {
    throw createHttpError(404, 'Book not found');
  }

  await prisma.readingSession.deleteMany({
    where: { id: sessionId, libraryBookId },
  });
};
