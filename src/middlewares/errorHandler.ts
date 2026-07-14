import type { ErrorRequestHandler } from 'express';
import createHttpError from 'http-errors';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (createHttpError.isHttpError(err)) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  res.status(500).json({
    message: err instanceof Error ? err.message : 'Internal server error',
  });
};

export default errorHandler;
