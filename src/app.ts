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

const allowedOrigins = [process.env.FRONTEND_DOMAIN, 'http://localhost:5173'];

app.use(httpLogger);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Read Journey API, by Viacheslav-Bo' });
});

app.use('/auth', authRouter);
app.use('/books', booksRouter);
app.use('/library', libraryRouter);
app.use('/reading', readingRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
