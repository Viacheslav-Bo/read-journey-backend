import { Router } from 'express';
import {
  login,
  logout,
  refresh,
  register,
} from '../controllers/authController.js';
import { validateBody } from '../middlewares/validate.js';
import {
  loginUserSchema,
  registerUserSchema,
} from '../validations/authValidation.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post('/register', validateBody(registerUserSchema), register);
router.post('/login', validateBody(loginUserSchema), login);
router.post('/logout', logout);

router.get('/me', authenticate, (req, res) => {
  res.status(200).json({ user: req.user });
});

router.post('/refresh', refresh);

export default router;
