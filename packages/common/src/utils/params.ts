import type { Request } from 'express';
import { NotFoundError } from '../errors/app-error.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

export const uuidParam = (req: Request, name: string, resource = 'Resource'): string => {
  const value = req.params[name];
  if (!isUuid(value)) throw new NotFoundError(resource);
  return value;
};

export const stringParam = (req: Request, name: string): string => String(req.params[name] ?? '');
