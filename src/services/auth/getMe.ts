import prisma from '../../prisma/client.js';
import createHttpError from 'http-errors';

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  return user;
};
