import { Router } from 'express';
const router = Router();

// ================= LIBRARY =================

// Бібліотека користувача
router.get('/', (req, res) => {
  res.status(200).json({ message: 'my library' });
});

// Додати книгу в бібліотеку
router.post('/', (req, res) => {
  res.status(201).json({ message: 'book added' });
});

// Видалити книгу з бібліотеки
router.delete('/:bookId', (req, res) => {
  res.status(200).json({ message: 'book removed' });
});

export default router;
