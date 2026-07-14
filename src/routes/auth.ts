import { Router } from 'express';
// ================= AUTH =================

const router = Router();

// Реєстрація
router.post('/register', (req, res) => {
  res.status(201).json({ message: 'register' });
});

// Логін
router.post('/login', (req, res) => {
  res.status(200).json({ message: 'login' });
});

// Поточний користувач
router.get('/me', (req, res) => {
  res.status(200).json({ message: 'current user' });
});

// Оновлення access token (якщо використовуватимеш refresh token)
router.post('/refresh', (req, res) => {
  res.status(200).json({ message: 'refresh token' });
});

// Вихід
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'logout' });
});

export default router;
