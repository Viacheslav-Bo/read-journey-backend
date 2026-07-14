import { Router } from 'express';
const router = Router();

// ================= READING =================

// Почати читання
router.post('/start', (req, res) => {
  res.status(201).json({ message: 'reading started' });
});

// Закінчити читання
router.post('/finish', (req, res) => {
  res.status(201).json({ message: 'reading finished' });
});

// Видалити запис із щоденника
router.delete('/:sessionId', (req, res) => {
  res.status(200).json({ message: 'reading session deleted' });
});

export default router;
