import { pino, type Logger } from 'pino';

export type { Logger };

export const createLogger = (service: string, level = process.env.LOG_LEVEL ?? 'info'): Logger =>
  pino({
    level,
    base: { service },
    redact: ['req.headers.cookie', 'req.headers.authorization', 'req.headers["x-internal-context"]'],
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
        : undefined,
  });
