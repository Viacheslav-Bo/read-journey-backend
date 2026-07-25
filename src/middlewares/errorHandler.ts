import type { ErrorRequestHandler } from 'express';
import createHttpError from 'http-errors';

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const isDev = process.env.NODE_ENV === 'development';

  const status = createHttpError.isHttpError(err) ? err.status : 500;
  const message = createHttpError.isHttpError(err)
    ? err.message
    : 'Internal server error';

  if (!createHttpError.isHttpError(err)) {
    req.log.error(err);
  }

  res.status(status).json({
    message,
    ...(isDev && err instanceof Error && { stack: err.stack }),
  });
};

export default errorHandler;
