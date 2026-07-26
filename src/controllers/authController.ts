import { SEVEN_DAYS } from '../constants/lifeTime.js';
import { loginUser } from '../services/auth/loginUser.js';
import { logoutUser } from '../services/auth/logoutUser.js';
import { registerUser } from '../services/auth/registerUser.js';
import { refreshUserSession } from '../services/auth/refreshSession.js';
import type { Request, Response } from 'express';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await registerUser(
    name,
    email,
    password,
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SEVEN_DAYS,
  });

  res.status(201).json({
    status: 201,
    message: 'Register in successfully',
    data: { user, accessToken },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser(email, password);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SEVEN_DAYS,
  });

  res.status(200).json({
    status: 200,
    message: 'Logged in successfully',
    data: { user, accessToken },
  });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  await logoutUser(refreshToken);
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken: oldRefreshToken } = req.cookies;
  const { accessToken, refreshToken } =
    await refreshUserSession(oldRefreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SEVEN_DAYS,
  });

  res.status(200).json({
    status: 200,
    message: 'Session refreshed',
    data: { accessToken },
  });
};
