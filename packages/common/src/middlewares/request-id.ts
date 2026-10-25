import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { INTERNAL_HEADERS } from '@novachat-enterprise-erp/contracts';

export const requestId = (): RequestHandler => (req, res, next) => {
  const incoming = req.headers[INTERNAL_HEADERS.REQUEST_ID];
  const id = typeof incoming === 'string' && incoming.length <= 128 ? incoming : randomUUID();
  req.requestId = id;
  req.headers[INTERNAL_HEADERS.REQUEST_ID] = id;
  res.setHeader(INTERNAL_HEADERS.REQUEST_ID, id);
  next();
};
