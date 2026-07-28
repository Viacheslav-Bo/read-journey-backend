import type { Request, Response } from 'express';
import type { z } from 'zod';
import createHttpError from 'http-errors';
import {
  idParamSchema,
  stopReadingSchema,
} from '../validations/readingValidation.js';
import { start } from '../services/reading/startReading.js';
import { stop } from '../services/reading/stopReading.js';
import { getReadingSessions } from '../services/reading/readingSession.js';
import { deleteReadingSession } from '../services/reading/deleteSession.js';
import { sessionParamSchema } from '../validations/readingValidation.js';

export const startReading = async (req: Request, res: Response) => {
  if (!req.user) throw createHttpError(401, 'Unauthorized');
  const user = req.user;
  const { id: libraryBookId } = req.validatedParams as z.infer<
    typeof idParamSchema
  >;

  await start(user.userId, libraryBookId);
  res.status(201).json({ message: 'Reading start' });
};

export const stopReading = async (req: Request, res: Response) => {
  if (!req.user) throw createHttpError(401, 'Unauthorized');
  const user = req.user;
  const { id: libraryBookId } = req.validatedParams as z.infer<
    typeof idParamSchema
  >;
  const { endPage } = req.validatedBody as z.infer<typeof stopReadingSchema>;

  await stop(user.userId, libraryBookId, endPage);
  res.status(200).json({ message: 'Reading stopped' });
};

export const stats = async (req: Request, res: Response) => {
  if (!req.user) throw createHttpError(401, 'Unauthorized');
  const user = req.user;
  const { id: libraryBookId } = req.validatedParams as z.infer<
    typeof idParamSchema
  >;

  const sessions = await getReadingSessions(user.userId, libraryBookId);
  res.status(200).json(sessions);
};

export const deleteSession = async (req: Request, res: Response) => {
  if (!req.user) throw createHttpError(401, 'Unauthorized');
  const { userId } = req.user;
  const { id: libraryBookId, sessionId } = req.validatedParams as z.infer<
    typeof sessionParamSchema
  >;

  await deleteReadingSession(userId, libraryBookId, sessionId);
  res.status(200).json({ message: 'Session removed' });
};
