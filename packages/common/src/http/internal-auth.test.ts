import { describe, expect, it } from 'vitest';
import { signInternalContext, verifyInternalContext } from './internal-auth.js';

const secret = 'x'.repeat(32);

describe('internal auth', () => {
  it('round-trips a signed context', () => {
    const headers = signInternalContext({ userId: 'u1', permissions: ['a'] }, secret);
    expect(verifyInternalContext(headers, secret)).toEqual({ userId: 'u1', permissions: ['a'] });
  });

  it('rejects a tampered payload', () => {
    const headers = signInternalContext({ userId: 'u1', permissions: [] }, secret);
    const forged = signInternalContext({ userId: 'admin', permissions: ['*'] }, 'y'.repeat(32));
    expect(verifyInternalContext({ ...headers, 'x-internal-context': forged['x-internal-context'] }, secret)).toBeNull();
  });

  it('rejects stale signatures', () => {
    const headers = signInternalContext({ userId: 'u1', permissions: [] }, secret, Date.now() - 120_000);
    expect(verifyInternalContext(headers, secret)).toBeNull();
  });
});

describe('serviceUrl', async () => {
  const { serviceUrl } = await import('../utils/env.js');
  it('accepts host:port and full URLs', () => {
    expect(serviceUrl('http://localhost:1').parse('auth-service:4001')).toBe('http://auth-service:4001');
    expect(serviceUrl('http://localhost:1').parse('https://api.example.com')).toBe('https://api.example.com');
    expect(serviceUrl('http://localhost:1').parse(undefined)).toBe('http://localhost:1');
  });
});
