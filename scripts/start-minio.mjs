import { config } from 'dotenv';
import { spawn } from 'node:child_process';
config();
const child = spawn(
  '.local/bin/minio',
  ['server', '.local/minio', '--address', '127.0.0.1:9000', '--console-address', '127.0.0.1:9001'],
  {
    env: {
      ...process.env,
      MINIO_ROOT_USER: process.env.S3_ACCESS_KEY,
      MINIO_ROOT_PASSWORD: process.env.S3_SECRET_KEY,
    },
    stdio: 'inherit',
  },
);
child.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
