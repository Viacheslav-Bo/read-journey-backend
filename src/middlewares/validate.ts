import createHttpError from 'http-errors';
import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

export const validate = (
  schema: ZodTypeAny,
  source: 'body' | 'query' = 'body',
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return next(createHttpError(400, message));
    }

    req[source] = result.data;
    next();
  };
};
