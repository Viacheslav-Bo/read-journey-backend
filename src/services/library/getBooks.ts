import prisma from '../../prisma/client.js';
import type { ReadingStatus } from '@prisma/client';

export const getBooksFromLibrary = (userId: string, status?: ReadingStatus) => {
  return prisma.libraryBook.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
  });
};
