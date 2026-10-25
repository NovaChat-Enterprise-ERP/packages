import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { signInternalContext } from '@novachat-enterprise-erp/common';
import type { AuthContext } from '@novachat-enterprise-erp/contracts';

export const TEST_SECRET = 't'.repeat(32);

export const createTestDatabase = async <TSchema extends Record<string, unknown>>(
  schema: TSchema,
  migrationsFolder: string,
  service: string,
) => {
  const client = new PGlite();
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder, migrationsSchema: 'drizzle', migrationsTable: `${service}_migrations` });
  return { db, close: () => client.close() };
};

export const asUser = (context: Partial<AuthContext> & { userId: string }) =>
  signInternalContext({ service: 'api-gateway', permissions: [], ...context }, TEST_SECRET);

export const asService = (service = 'test-service', context: Partial<AuthContext> = {}) =>
  signInternalContext({ permissions: [], ...context, service }, TEST_SECRET);
