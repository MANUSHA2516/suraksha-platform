export function readable(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}
export function percent(part: number, total: number): number {
  return total ? Math.round((part / total) * 100) : 0;
}
export function isFreshPosition(capturedAt: string, now = Date.now()): boolean {
  const age = now - Date.parse(capturedAt);
  return age >= -30000 && age <= 120000;
}
export function canAdvance(current: string, next: string): boolean {
  const stages = ['FILED', 'UNDER_INVESTIGATION', 'SUSPECT_CONTACTED', 'RESOLVED'];
  return stages.indexOf(next) === stages.indexOf(current) + 1;
}

import en from './locales/en/common.json';
import si from './locales/si/common.json';
import ta from './locales/ta/common.json';
let locale: 'en' | 'si' | 'ta' = 'en';
const catalogs: Record<string, Record<string, string>> = { en, si, ta };
export function setLocale(value: string) {
  locale = value === 'si' || value === 'ta' ? value : 'en';
}
export function t(key: string): string {
  return catalogs[locale]?.[key] ?? catalogs.en?.[key] ?? key;
}
export function translationStatus() {
  return { locale, fallback: locale !== 'en', verified: locale === 'en' };
}
