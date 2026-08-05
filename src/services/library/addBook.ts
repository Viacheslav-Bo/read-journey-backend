import prisma from '../../prisma/client.js';
import { Prisma } from '@prisma/client';
import createHttpError from 'http-errors';
import type { z } from 'zod';
import type { addBookSchema } from '../../validations/libraryValidation.js';

type AddBookBody = z.infer<typeof addBookSchema>;

export const addBookToLibrary = async (userId: string, data: AddBookBody) => {
  try {
    return await prisma.libraryBook.create({
      data: {
        ...data,
        userId,
      },
    });
  } catch (err) {
    console.error(err);

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw createHttpError(409, 'This book is already in your library');
    }

    throw err;
  }
};
