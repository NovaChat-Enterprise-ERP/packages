import { createServer, type Server } from 'node:http';
import type { Express } from 'express';
import type { Logger } from '../logger.js';

export type ShutdownHook = () => Promise<void> | void;

export interface StartServerOptions {
  app: Express;
  port: number;
  logger: Logger;
  onShutdown?: ShutdownHook[];
  configure?: (server: Server) => void;
}

export const startServer = ({ app, port, logger, onShutdown = [], configure }: StartServerOptions): Server => {
  const server = createServer(app);
  configure?.(server);
  server.listen(port, () => logger.info(`Listening on :${port}`));

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Shutting down');
    const timer = setTimeout(() => process.exit(1), 10_000).unref();
    server.close();
    for (const hook of onShutdown) {
      try {
        await hook();
      } catch (error) {
        logger.error({ err: error }, 'Shutdown hook failed');
      }
    }
    clearTimeout(timer);
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error({ err: reason }, 'Unhandled rejection'));
  return server;
};
