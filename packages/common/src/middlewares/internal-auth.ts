import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../errors/app-error.js';
import { verifyInternalContext } from '../http/internal-auth.js';

export const internalAuth =
  (secret: string): RequestHandler =>
  (req, _res, next) => {
    const context = verifyInternalContext(req.headers, secret);
    if (!context) return next(new UnauthorizedError('Missing or invalid internal credentials'));
    req.auth = context;
    next();
  };
