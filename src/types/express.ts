import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      validatedBody?: unknown;
      validatedQuery?: unknown;
    }
  }
}

export {};
