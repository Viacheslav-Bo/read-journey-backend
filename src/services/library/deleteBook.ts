import prisma from '../../prisma/client.js';

export const deleteBookFromLibrary = (userId: string, bookId: string) => {
  return prisma.libraryBook.deleteMany({ where: { id: bookId, userId } });
};
