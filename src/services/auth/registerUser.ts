import prisma from '../../prisma/client.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const isUniqueMail = await prisma.user.findUnique({
    where: { email },
  });

  if (isUniqueMail) {
    throw createHttpError(400, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const { password: _, ...rest } = newUser;

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  return { ...rest, token };
};
