import { config } from 'dotenv';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
config();
const child = spawn(
  process.env.AI_PYTHON || 'python',
  ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'],
  { cwd: resolve('services/ai'), env: process.env, stdio: 'inherit' },
);
child.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
