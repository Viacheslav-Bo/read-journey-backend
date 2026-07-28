import { Router } from 'express';
import { validateBody, validateParams } from '../middlewares/validate.js';
import {
  idParamSchema,
  stopReadingSchema,
} from '../validations/readingValidation.js';
import {
  startReading,
  stats,
  stopReading,
} from '../controllers/readingController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post(
  '/:id/start',
  authenticate,
  validateParams(idParamSchema),
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

export default router;
