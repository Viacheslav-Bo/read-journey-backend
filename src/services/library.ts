import prisma from '../prisma/client.js';

export const getLibraryAllBooks = async () => {
  return await prisma.libraryBook.findMany();
};

export const getLibraryBookById = async (id: string) => {
  return prisma.libraryBook.findUnique({ where: { id } });
};

type AddBookBody = {
  openLibraryId: string;
  title: string;
  author: string;
  coverUrl?: string;
  totalPages: number;
};

export const addBookToLibrary = (userId: string, data: AddBookBody) => {
  return prisma.libraryBook.create({
    data: {
      ...data,
      userId,
    },
  });
};
