import { config } from 'dotenv';
import { spawnSync } from 'node:child_process';
config({ path: '.env' });
const result = spawnSync(
  process.execPath,
  [
    'node_modules/prisma/build/index.js',
    ...process.argv.slice(2),
    '--schema',
    'services/api/prisma/schema.prisma',
  ],
  { stdio: 'inherit', env: process.env },
);
process.exit(result.status ?? 1);
