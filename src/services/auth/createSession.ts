import prisma from '../../prisma/client.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { SEVEN_DAYS, ACCESS_TOKEN_TTL } from '../../constants/lifeTime.js';

export const createSession = async (userId: string) => {
  const payload = { userId };
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  const accessToken = jwt.sign(payload, jwtSecret, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
  const refreshToken = crypto.randomBytes(32).toString('hex');
  await prisma.session.create({
    data: {
      userId,
      refreshToken,
      expiresAt: new Date(Date.now() + SEVEN_DAYS),
    },
  });
  return { accessToken, refreshToken };
};
