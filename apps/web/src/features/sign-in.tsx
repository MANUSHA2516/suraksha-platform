'use client';
import { t } from '@suraksha/shared';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { SafeUser } from '@suraksha/types';
import { api } from '../lib/api';
import { Field } from '../components/ui';
export function SignIn({ path, onSignedIn }: { path: string; onSignedIn: (u: SafeUser) => void }) {
  const role = path.startsWith('/police')
    ? 'police'
    : path.startsWith('/counselor')
      ? 'counselor'
      : path.startsWith('/legal')
        ? 'legal'
        : 'admin';
  const words = {
    admin: ['Protecting staff & communities, together', 'Welcome back', 'Staff ID'],
    police: ['Respond faster. Protect more.', 'Officer sign in', 'Badge ID'],
    counselor: ['Listen closely. Help fully.', 'Counselor sign in', 'Practitioner ID'],
    legal: ['Accessible guidance. Human support.', 'Legal advisor sign in', 'Advisor ID'],
  }[role];
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [recovery, setRecovery] = useState(false);
  return (
    <main className="sign-in">
      <section className="trust-panel">
        <a className="brand" href="/">
          <ShieldCheck />
          {t('SURAKSHA')}
        </a>
        <div>
          <small>{t('GUARDIAN ACCESS PORTAL')}</small>
          <h1>{words[0]}</h1>
          <p>{t('Restricted access for the Suraksha response and support network.')}</p>
          <ul>
            <li>{t('Verified staff accounts')}</li>
            <li>{t('Role-restricted case access')}</li>
            <li>{t('Audited evidence handling')}</li>
          </ul>
        </div>
        <small>{t('Research prototype \u00B7 development services')}</small>
      </section>
      <section className="login-panel">
        <div className="login-top">
          <a href="/admin/sign-in">{t('Admin')}</a>
          <a href="/police/sign-in">{t('Police')}</a>
          <a href="/counselor/sign-in">{t('Counselor')}</a>
          <a href="/legal/sign-in">{t('Legal')}</a>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              const result = await api('/auth/login', 'POST', { login, password, rememberDevice });
              onSignedIn(result.user);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Sign in failed');
            } finally {
              setBusy(false);
            }
          }}
        >
          <small>
            {role.toUpperCase()}
            {t('PORTAL')}
          </small>
          <h1>{words[1]}</h1>
          <p>{t('Sign in with your verified staff credentials.')}</p>
          <Field label={words[2] || 'Staff ID'}>
            <input
              required
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </Field>
          <Field label={t('Password')}>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <label className="check">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
            />
            {t('Remember this device')}
          </label>
          <button type="button" className="text-link" onClick={() => setRecovery(!recovery)}>
            {t('Forgot access code?')}
          </button>
          {recovery && (
            <p role="status">
              {t(
                'Contact your platform administrator with your staff identifier. Government identity recovery is not connected.',
              )}
            </p>
          )}
          <p className="muted">
            {t('Sessions expire automatically. Contact your administrator for access recovery.')}
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button className="full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in →'}
          </button>
          <div className="divider">{t('alternate access')}</div>
          <button type="button" className="secondary full" disabled>
            {t('Government SSO \u2014 not connected')}
          </button>
          <div className="trust-row">{t('\u25C8 Private access \u25C8 Audited actions')}</div>
        </form>
      </section>
    </main>
  );
}
