import prisma from '../prisma/client.js';

export const getAllBooks = async () => {
  return await prisma.libraryBook.findMany();
};

export const getBookById = async (id: string) => {
  return prisma.libraryBook.findUnique({ where: { id } });
};
