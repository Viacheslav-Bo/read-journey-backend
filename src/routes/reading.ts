import { Router } from 'express';
// import { authenticate } from '../middlewares/authenticate.js';
// import { validateQuery } from '../middlewares/validate.js';
// import { statusOfBook } from '../controllers/libraryController.js';
const router = Router();

// ================= READING =================

// Почати читання
router.post('/start', (req, res) => {
  res.status(201).json({ message: 'reading finished' });
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
