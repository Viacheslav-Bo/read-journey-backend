import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(
      createHttpError(401, 'Authorization header missing or invalid'),
    );
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw createHttpError(401, 'Access token is missing');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

    req.user = payload;
    return next();
  } catch {
    return next(createHttpError(401, 'Token is invalid or expired'));
  }
};
