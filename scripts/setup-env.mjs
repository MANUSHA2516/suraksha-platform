import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
try {
  await readFile('.env');
  console.log('.env exists; preserved.');
} catch {
  let env = await readFile('.env.example', 'utf8');
  const values = {
    REPLACE_WITH_GENERATED_PASSWORD: randomBytes(24).toString('hex'),
    REPLACE_WITH_GENERATED_TOKEN: randomBytes(32).toString('hex'),
    REPLACE_WITH_GENERATED_ACCESS_KEY: randomBytes(12).toString('hex'),
    REPLACE_WITH_GENERATED_SECRET: randomBytes(24).toString('hex'),
    REPLACE_WITH_A_STRONG_DEMO_PASSWORD: randomBytes(20).toString('base64url') + '1!',
  };
  env = env.replaceAll('REPLACE_WITH_64_HEX_CHARACTERS', () => randomBytes(32).toString('hex'));
  for (const [from, to] of Object.entries(values)) env = env.replaceAll(from, to);
  await writeFile('.env', env, { mode: 0o600 });
  console.log('Created .env with random local secrets; no values printed.');
}
