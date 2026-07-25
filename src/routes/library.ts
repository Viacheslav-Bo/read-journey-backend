import { Router } from 'express';

import {
  getLibraryBooksController,
  getLibraryBookByIdController,
  addBookToLibraryController,
} from '../controllers/libraryController.js';

const router = Router();
// ================= LIBRARY =================

// Бібліотека користувача
router.get('/', getLibraryBooksController);

router.get('/:bookId', getLibraryBookByIdController);

// Додати книгу в бібліотеку
router.post('/', addBookToLibraryController);

// // Видалити книгу з бібліотеки
// router.delete('/:bookId', (req, res) => {
//   res.status(200).json({ message: 'book removed' });
// });

export default router;
