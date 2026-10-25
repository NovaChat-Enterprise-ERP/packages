import { Router } from 'express';

export type ReadinessCheck = () => Promise<void>;

export const healthRouter = (service: string, checks: Record<string, ReadinessCheck> = {}): Router => {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.json({ service, status: 'ok', uptime: process.uptime() });
  });
  router.get('/ready', async (_req, res) => {
    const results: Record<string, string> = {};
    let ready = true;
    await Promise.all(
      Object.entries(checks).map(async ([name, check]) => {
        try {
          await check();
          results[name] = 'ok';
        } catch (error) {
          ready = false;
          results[name] = error instanceof Error ? error.message : 'failed';
        }
      }),
    );
    res.status(ready ? 200 : 503).json({ service, status: ready ? 'ready' : 'not_ready', checks: results });
  });
  return router;
};
