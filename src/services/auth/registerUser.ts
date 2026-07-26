import prisma from '../../prisma/client.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { createSession } from './createSession.js';

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const isUniqueMail = await prisma.user.findUnique({
    where: { email },
  });

  if (isUniqueMail) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const { accessToken, refreshToken } = await createSession(newUser.id);

  const { password: _, ...rest } = newUser;

  return { user: rest, accessToken, refreshToken };
};
