import prisma from '../../prisma/client.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { createSession } from './createSession.js';

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const { accessToken, refreshToken } = await createSession(user.id);

  const { password: _, ...rest } = user;
  return { user: rest, accessToken, refreshToken };
};
