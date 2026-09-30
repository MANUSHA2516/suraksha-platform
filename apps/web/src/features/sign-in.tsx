'use client';
import { t } from '@suraksha/shared';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { SafeUser } from '@suraksha/types';
import { api } from '../lib/api';
import { Field } from '../components/ui';

const portal = {
  admin: {
    headline: 'Protecting staff & communities, together',
    welcome: 'Welcome back',
    idLabel: 'Staff ID',
    sso: 'Government SSO',
    trust: [
      'Verified staff accounts only',
      'Role-restricted admin access',
      'Audited evidence and case actions',
    ],
  },
  police: {
    headline: 'Respond faster. Protect more.',
    welcome: 'Officer sign in',
    idLabel: 'Badge ID',
    sso: 'Police ID SSO',
    trust: [
      'Verified police staff accounts',
      'Role-restricted case and SOS access',
      'Audited evidence handling',
    ],
  },
  counselor: {
    headline: 'Listen closely. Help fully.',
    welcome: 'Counselor sign in',
    idLabel: 'Practitioner ID',
    sso: 'Health Ministry ID SSO',
    trust: [
      'Verified counselor accounts',
      'Role-restricted client session access',
      'Audited care notes and messages',
    ],
  },
  legal: {
    headline: 'Accessible guidance. Human support.',
    welcome: 'Legal advisor sign in',
    idLabel: 'Advisor ID',
    sso: 'Legal Bar SSO',
    trust: [
      'Verified legal advisor accounts',
      'Role-restricted query access',
      'Audited published guidance actions',
    ],
  },
} as const;

export function SignIn({ path, onSignedIn }: { path: string; onSignedIn: (u: SafeUser) => void }) {
  const role = path.startsWith('/police')
    ? 'police'
    : path.startsWith('/counselor')
      ? 'counselor'
      : path.startsWith('/legal')
        ? 'legal'
        : 'admin';
  const copy = portal[role];
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          <h1>{copy.headline}</h1>
          <p>{t('Restricted access for the Suraksha response and support network.')}</p>
          <ul>
            {copy.trust.map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
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
          <h1>{copy.welcome}</h1>
          <p>{t('Sign in with your verified staff credentials.')}</p>
          <Field label={copy.idLabel}>
            <input
              required
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </Field>
          <Field label={t('Password')}>
            <div className="password-field">
              <input
                aria-label={t('Password')}
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="text-link password-toggle"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? t('Hide') : t('Show')}
              </button>
            </div>
          </Field>
          <div className="login-row">
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
          </div>
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
            {t(copy.sso + ' \u2014 not connected')}
          </button>
          <div className="trust-row">{t('\u25C8 Private access \u25C8 Audited actions')}</div>
        </form>
      </section>
    </main>
  );
}
