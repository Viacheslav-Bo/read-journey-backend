import { Router } from 'express';
import {
  getBooksController,
  getBookByIdController,
} from '../controllers/booksController.js';

const router = Router();

// ================= BOOKS =================
// Рекомендовані книги
router.get('/', getBooksController);

// Інформація про одну книгу
router.get('/:bookId', getBookByIdController);

export default router;
