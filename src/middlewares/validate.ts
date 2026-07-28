import createHttpError from 'http-errors';
import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

export const validateBody = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return next(createHttpError(400, message));
    }

    req.validatedBody = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return next(createHttpError(400, message));
    }

    req.validatedQuery = result.data;
    next();
  };
};
