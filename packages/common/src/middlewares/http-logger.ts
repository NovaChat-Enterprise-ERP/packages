import { pinoHttp } from 'pino-http';
import type { RequestHandler } from 'express';
import type { Logger } from '../logger.js';

export const httpLogger = (logger: Logger): RequestHandler =>
  pinoHttp({
    logger,
    genReqId: (req) => (req as { requestId?: string }).requestId ?? '',
    autoLogging: { ignore: (req) => req.url === '/health' || req.url === '/ready' },
    customLogLevel: (_req, res, err) =>
      err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
  });
