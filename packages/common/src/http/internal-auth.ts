import { createHmac, timingSafeEqual } from 'node:crypto';
import { INTERNAL_HEADERS, type AuthContext } from '@novachat-enterprise-erp/contracts';

const MAX_SKEW_MS = 60_000;

const sign = (secret: string, timestamp: string, payload: string): string =>
  createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('base64url');

export const signInternalContext = (
  context: AuthContext,
  secret: string,
  now = Date.now(),
): Record<string, string> => {
  const payload = Buffer.from(JSON.stringify(context)).toString('base64url');
  const timestamp = String(now);
  return {
    [INTERNAL_HEADERS.CONTEXT]: payload,
    [INTERNAL_HEADERS.TIMESTAMP]: timestamp,
    [INTERNAL_HEADERS.SIGNATURE]: sign(secret, timestamp, payload),
  };
};

export const verifyInternalContext = (
  headers: Record<string, string | string[] | undefined>,
  secret: string,
  now = Date.now(),
): AuthContext | null => {
  const payload = headers[INTERNAL_HEADERS.CONTEXT];
  const timestamp = headers[INTERNAL_HEADERS.TIMESTAMP];
  const signature = headers[INTERNAL_HEADERS.SIGNATURE];
  if (typeof payload !== 'string' || typeof timestamp !== 'string' || typeof signature !== 'string') {
    return null;
  }
  if (Math.abs(now - Number(timestamp)) > MAX_SKEW_MS) return null;

  const expected = Buffer.from(sign(secret, timestamp, payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const context = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthContext;
    return { ...context, permissions: context.permissions ?? [] };
  } catch {
    return null;
  }
};

export const stripInternalHeaders = (headers: Record<string, unknown>): void => {
  delete headers[INTERNAL_HEADERS.CONTEXT];
  delete headers[INTERNAL_HEADERS.TIMESTAMP];
  delete headers[INTERNAL_HEADERS.SIGNATURE];
};
