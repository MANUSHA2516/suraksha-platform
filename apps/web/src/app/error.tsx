'use client';
import { t } from '@suraksha/shared';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="center">
      <h1>{t('Unable to open this workspace')}</h1>
      <button onClick={reset}>{t('Try again')}</button>
    </main>
  );
}
