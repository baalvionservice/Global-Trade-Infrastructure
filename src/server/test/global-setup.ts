/**
 * @file server/test/global-setup.ts
 * @description Vitest global setup. Boots a real (embedded) PostgreSQL, applies
 * the Prisma migrations, and exposes it via DATABASE_URL so the DB-backed tests
 * run against genuine persistence. Tears the server down afterwards.
 */
import EmbeddedPostgres from 'embedded-postgres';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';

const PORT = 55433;
const USER = 'gti';
const PASSWORD = 'gti';
const DB = 'gti_orch_test';
export const TEST_DATABASE_URL = `postgresql://${USER}:${PASSWORD}@127.0.0.1:${PORT}/${DB}?schema=public`;

let pg: InstanceType<typeof EmbeddedPostgres> | null = null;

export default async function setup(): Promise<() => Promise<void>> {
  const root = process.cwd();
  const dir = path.join(os.tmpdir(), `gti-pg-test-${process.pid}-${PORT}`);
  pg = new EmbeddedPostgres({ databaseDir: dir, user: USER, password: PASSWORD, port: PORT, persistent: false });
  await pg.initialise();
  await pg.start();
  try {
    await pg.createDatabase(DB);
  } catch {
    /* already exists */
  }

  process.env.DATABASE_URL = TEST_DATABASE_URL;

  // Apply the real migrations to the fresh test database.
  const require = createRequire(import.meta.url);
  const pkgJsonPath = require.resolve('prisma/package.json', { paths: [root] });
  const pkg = require('prisma/package.json') as { bin: string | Record<string, string> };
  const binRel = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.prisma;
  const entry = path.join(path.dirname(pkgJsonPath), binRel);
  const res = spawnSync(process.execPath, [entry, 'migrate', 'deploy'], {
    cwd: root,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    encoding: 'utf-8',
  });
  if (res.status !== 0) {
    throw new Error(`prisma migrate deploy failed:\n${res.stdout}\n${res.stderr}`);
  }

  return async () => {
    if (pg) await pg.stop();
  };
}
