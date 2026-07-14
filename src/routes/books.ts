import { Router } from 'express';
const router = Router();

// ================= BOOKS =================
// Рекомендовані книги
router.get('/', (req, res) => {
  res.status(200).json({ message: 'recommended books' });
});

// Інформація про одну книгу
router.get('/:bookId', (req, res) => {
  res.status(200).json({ message: 'book details' });
});

export default router;
