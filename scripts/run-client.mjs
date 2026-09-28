import { config } from 'dotenv';
import { spawn } from 'node:child_process';
config();
const target = process.argv[2];
if (!['web', 'mobile'].includes(target)) throw new Error('Expected web or mobile');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(
  npmCommand,
  ['run', target === 'web' ? 'dev' : 'start', '-w', `@suraksha/${target}`],
  {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  },
);
child.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
