import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(__dirname, '../../../../.env') });
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '../../.env') });
export function required(name: string): string {
  const value = process.env[name];
  if (!value || value.startsWith('REPLACE_')) throw new Error(`Configure ${name}`);
  return value;
}
export function webOrigins(): string[] {
  return [
    ...new Set(
      (process.env.WEB_ORIGIN || 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  ];
}
