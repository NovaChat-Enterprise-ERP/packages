import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ApiErrorBody } from '@novachat-enterprise-erp/contracts';
import { AppError, NotFoundError } from '../errors/app-error.js';
import type { Logger } from '../logger.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
};

export const errorHandler =
  (logger: Logger): ErrorRequestHandler =>
  (err, req, res, _next) => {
    const appError =
      err instanceof AppError
        ? err
        : err?.type === 'entity.parse.failed'
          ? new AppError(400, 'INVALID_JSON', 'Malformed JSON body')
          : new AppError(500, 'INTERNAL_ERROR', 'Something went wrong');

    if (appError.statusCode >= 500) logger.error({ err, requestId: req.requestId }, 'Unhandled error');

    const body: ApiErrorBody = {
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details,
        requestId: req.requestId,
      },
    };
    res.status(appError.statusCode).json(body);
  };
