// Generates the initial Prisma migration against an embedded Postgres (no Docker).
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const mod = require('embedded-postgres');
const EmbeddedPostgres = mod.default || mod;

(async () => {
  const dir = path.join(os.tmpdir(), 'gti-pg-migrate-' + Date.now());
  const port = 55432;
  const root = path.join(__dirname, '..');
  const pg = new EmbeddedPostgres({ databaseDir: dir, user: 'gti', password: 'gti', port, persistent: false });
  await pg.initialise();
  await pg.start();
  try { await pg.createDatabase('gti_orchestration'); } catch (_) { /* already exists */ }
  const url = `postgresql://gti:gti@127.0.0.1:${port}/gti_orchestration?schema=public`;
  // Resolve the Prisma CLI JS entry and run it with node directly — avoids
  // Windows .cmd shell quoting issues with the space in the repo path.
  const pkgJsonPath = require.resolve('prisma/package.json', { paths: [root] });
  const pkg = require(pkgJsonPath);
  const binRel = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.prisma;
  const entry = path.join(path.dirname(pkgJsonPath), binRel);
  const args = process.argv.slice(2).length ? process.argv.slice(2) : ['migrate', 'dev', '--name', 'init', '--skip-generate'];
  const res = spawnSync(process.execPath, [entry, ...args], {
    stdio: 'inherit',
    cwd: root,
    shell: false,
    env: { ...process.env, DATABASE_URL: url },
  });
  await pg.stop();
  process.exit(res.status == null ? 1 : res.status);
})().catch((e) => { console.error(e); process.exit(1); });
