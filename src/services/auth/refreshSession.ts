import prisma from '../../prisma/client.js';
import createHttpError from 'http-errors';
import { createSession } from './createSession.js';

export const refreshUserSession = async (refreshToken?: string) => {
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }
  const session = await prisma.session.findUnique({
    where: { refreshToken },
  });

  if (!session) {
    throw createHttpError(401, 'Invalid session');
  }

  if (session.expiresAt < new Date()) {
    throw createHttpError(401, 'Session token expired');
  }

  await prisma.session.deleteMany({ where: { refreshToken } });

  const newSession = await createSession(session.userId);

  return newSession;
};
