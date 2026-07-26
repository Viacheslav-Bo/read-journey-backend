import { Router } from 'express';
import {
  login,
  logout,
  refresh,
  register,
} from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import {
  loginUserSchema,
  registerUserSchema,
} from '../validations/authValidation.js';
import { authenticate } from '../middlewares/authenticate.js';

// ================= AUTH =================

const router = Router();

// Реєстрація
router.post('/register', validate(registerUserSchema), register);

// Логін
router.post('/login', validate(loginUserSchema), login);

// Поточний користувач
router.get('/me', authenticate, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Оновлення access token (якщо використовуватимеш refresh token)
router.post('/refresh', refresh);

// Вихід
router.post('/logout', logout);

export default router;
