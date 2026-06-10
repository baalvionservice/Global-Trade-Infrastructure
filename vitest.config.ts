import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
    // A real (embedded) PostgreSQL is started once for the whole run.
    globalSetup: ['./src/server/test/global-setup.ts'],
    // DB-backed tests share one server; serialize to keep them isolated.
    fileParallelism: false,
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 30000,
    hookTimeout: 120000,
    teardownTimeout: 30000,
    env: {
      DATABASE_URL: 'postgresql://gti:gti@127.0.0.1:55433/gti_orch_test?schema=public',
      GATEWAY_SIGNING_SECRET: 'test_gateway_signing_secret_min_32_chars_long',
    },
  },
});
