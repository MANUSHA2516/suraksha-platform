import { t } from '@suraksha/shared';
export default function NotFound() {
  return (
    <main className="center">
      <h1>{t('Page not found')}</h1>
      <a href="/">{t('Return to sign in')}</a>
    </main>
  );
}
