import { Router } from 'express';

import {
  addBook,
  deleteBook,
  getBooks,
  getOneBook,
} from '../controllers/libraryController.js';
import { authenticate } from '../middlewares/authenticate.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.js';
import {
  addBookSchema,
  getBooksSchema,
  idParamSchema,
} from '../validations/libraryValidation.js';

const router = Router();

router.get('/', authenticate, validateQuery(getBooksSchema), getBooks);
router.get('/:id', authenticate, validateParams(idParamSchema), getOneBook);
router.post('/', authenticate, validateBody(addBookSchema), addBook);
router.delete('/:id', authenticate, validateParams(idParamSchema), deleteBook);

export default router;
