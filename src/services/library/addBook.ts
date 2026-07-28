import prisma from '../../prisma/client.js';
import type { z } from 'zod';
import type { addBookSchema } from '../../validations/libraryValidation.js';

type AddBookBody = z.infer<typeof addBookSchema>;

export const addBookToLibrary = (userId: string, data: AddBookBody) => {
  return prisma.libraryBook.create({
    data: {
      ...data,
      userId,
    },
  });
};
