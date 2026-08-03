import { Router } from 'express';
import { validateBody, validateParams } from '../middlewares/validate.js';
import {
  idParamSchema,
  startReadingSchema,
  stopReadingSchema,
  sessionParamSchema,
} from '../validations/readingValidation.js';
import {
  startReading,
  stats,
  stopReading,
  deleteSession,
} from '../controllers/readingController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post(
  '/:id/start',
  authenticate,
  validateParams(idParamSchema),
  validateBody(startReadingSchema),
  startReading,
);

router.post(
  '/:id/stop',
  authenticate,
  validateParams(idParamSchema),
  validateBody(stopReadingSchema),
  stopReading,
);

router.get('/:id/stats', authenticate, validateParams(idParamSchema), stats);

router.delete(
  '/:id/sessions/:sessionId',
  authenticate,
  validateParams(sessionParamSchema),
  deleteSession,
);

export default router;
