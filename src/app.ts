import express from 'express';
import cors from 'cors';

import logger from './middlewares/logger.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';

import authRouter from './routes/auth.js';
import booksRouter from './routes/books.js';
import libraryRouter from './routes/library.js';
import readingRouter from './routes/reading.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(logger);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello word!' });
});

app.use('/auth', authRouter);
app.use('/books', booksRouter);
app.use('/library', libraryRouter);
app.use('/reading', readingRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
