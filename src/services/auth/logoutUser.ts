import prisma from '../../prisma/client.js';
import createHttpError from 'http-errors';

export const logoutUser = async (refreshToken?: string) => {
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }

  await prisma.session.deleteMany({ where: { refreshToken } });
};
