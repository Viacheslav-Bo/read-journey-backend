import { httpLogger } from './middlewares/httpLogger.js';
import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';

import authRouter from './routes/auth.js';
import booksRouter from './routes/books.js';
import libraryRouter from './routes/library.js';
import readingRouter from './routes/reading.js';

const app = express();

app.use(httpLogger);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello worllld!' });
});

app.use('/auth', authRouter);
app.use('/books', booksRouter);
app.use('/library', libraryRouter);
app.use('/reading', readingRouter);

app.get('/test', (req, res) => {
  throw new Error('Hello err!');
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
