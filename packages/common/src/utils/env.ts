import { z } from 'zod';

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  INTERNAL_SECRET: z.string().min(32, 'INTERNAL_SECRET must be at least 32 characters'),
});

export const serviceUrl = (fallback: string) =>
  z
    .string()
    .default(fallback)
    .transform((value) => (/^https?:\/\//.test(value) ? value : `http://${value}`))
    .pipe(z.url());

export const loadEnv = <S extends z.ZodType>(
  schema: S,
  source: NodeJS.ProcessEnv = process.env,
): z.output<S> => {
  const result = schema.safeParse(source);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid environment configuration:\n${lines.join('\n')}`);
  }
  return result.data;
};
