import { randomBytes, randomUUID, createHash } from 'node:crypto';

export const newId = (): string => randomUUID();

export const randomToken = (bytes = 32): string => randomBytes(bytes).toString('base64url');

export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');
