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
