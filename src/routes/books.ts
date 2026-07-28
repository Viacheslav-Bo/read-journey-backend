import { Router } from 'express';
import { validateQuery } from '../middlewares/validate.js';
import { booksQuerySchema } from '../validations/bookValidation.js';
import { getBooks } from '../controllers/booksController.js';

const router = Router();

// ================= BOOKS =================
// Рекомендовані книги
router.get('/', validateQuery(booksQuerySchema), getBooks);

// Інформація про одну книгу
// router.get('/:bookId');

export default router;
