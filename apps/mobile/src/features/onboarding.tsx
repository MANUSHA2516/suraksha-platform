import { deviceNotifications } from '../providers/notifications';
import { disguiseProvider } from '../providers/disguise';
import { t } from '@suraksha/shared';
import React, { useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { api, saveSession, signOut } from '../lib/api';
import { useSession, ScreenProps } from '../lib/context';
import {
  Page,
  Card,
  Button,
  Choice,
  Dots,
  Input,
  PinPad,
  Trust,
  colors,
  s,
} from '../components/ui';
export function DisguiseUtility() {
  const session = useSession();
  const [guardian, setGuardian] = useState(false);
  const [pin, setPin] = useState('');
  const [display, setDisplay] = useState('0');
  const [operand, setOperand] = useState<number | null>(null);
  const [op, setOp] = useState('');
  const [note, setNote] = useState('');
  const disguise = session.user?.disguise || 'calculator';
  if (guardian)
    return (
      <Page
        title={t('Guardian mode')}
        subtitle={t('Enter your private PIN to open Suraksha')}
        tag="APP LOCK"
      >
        <View style={{ backgroundColor: colors.navy, borderRadius: 25, padding: 24 }}>
          <Text style={s.hero}>{t('\u2662')}</Text>
          <PinPad label={t('6-digit PIN')} value={pin} onChange={setPin} />
          <Dots step={Math.min(pin.length, 6)} total={6} />
          <Button
            title={t('Continue to Suraksha')}
            onPress={async () => {
              await api('/me/security/unlock', 'POST', { pin });
              session.setLocked(false);
              setPin('');
            }}
          />
          <Button
            title={'Back to ' + disguise}
            tone="outline"
            onPress={() => {
              setGuardian(false);
              setPin('');
            }}
          />
          {session.user?.biometricEnabled && (
            <Button
              title={t('Use biometric unlock')}
              onPress={async () => {
                const result = await LocalAuthentication.authenticateAsync({
                  promptMessage: 'Unlock Suraksha',
                  disableDeviceFallback: true,
                });
                if (result.success) session.setLocked(false);
                else throw new Error('Biometric unlock was not completed');
              }}
            />
          )}
        </View>
      </Page>
    );
  return (
    <Page
      title={disguise === 'calculator' ? 'Calculator' : disguise === 'notes' ? 'Notes' : 'Weather'}
    >
      <Pressable
        accessibilityLabel={t('Open private PIN entry')}
        onLongPress={() => setGuardian(true)}
        delayLongPress={1500}
      >
        <Text style={[s.text, { textAlign: 'right', fontSize: 38, marginVertical: 40 }]}>
          {disguise === 'calculator'
            ? display
            : disguise === 'notes'
              ? 'My notes'
              : 'Forecast unavailable'}
        </Text>
      </Pressable>
      {disguise === 'notes' ? (
        <Input label={t('Note')} value={note} onChange={setNote} multiline />
      ) : disguise === 'calculator' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['7', '8', '9', '+', '4', '5', '6', '−', '1', '2', '3', '×', 'C', '0', '=', '÷'].map(
            (key) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key}
                style={[s.card, { width: '22%', alignItems: 'center' }]}
                onPress={() => {
                  if (key === 'C') {
                    setDisplay('0');
                    setOperand(null);
                    setOp('');
                  } else if (['+', '−', '×', '÷'].includes(key)) {
                    setOperand(Number(display));
                    setOp(key);
                    setDisplay('0');
                  } else if (key === '=') {
                    if (operand !== null) {
                      const n = Number(display);
                      setDisplay(
                        String(
                          op === '+'
                            ? operand + n
                            : op === '−'
                              ? operand - n
                              : op === '×'
                                ? operand * n
                                : n
                                  ? operand / n
                                  : 'Error',
                        ),
                      );
                      setOperand(null);
                    }
                  } else setDisplay((v) => (v === '0' ? key : (v + key).slice(0, 14)));
                }}
              >
                <Text style={s.text}>{key}</Text>
              </Pressable>
            ),
          )}
        </View>
      ) : null}
    </Page>
  );
}
export function OnboardingScreen({ navigation: n, route }: ScreenProps) {
  const id = route.name;
  const session = useSession();
  const [form, setForm] = useState({ login: '', phone: '', name: '', password: '' });
  const [register, setRegister] = useState(false);
  const [consent, setConsent] = useState(false);
  const [locale, setLocale] = useState('en');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [biometric, setBiometric] = useState(false);
  const [disguise, setDisguise] = useState(session.user?.disguise || 'calculator');
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  if (id === 'M01')
    return (
      <Page title={t('')} tag="">
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={s.hero}>{t('\u2662')}</Text>
          <Text style={s.title}>
            {t('WELCOME TO')}
            {'\n'}
            {t('SURAKSHA')}
          </Text>
          <Dots />
          <Button title={t('GET STARTED \u276F')} onPress={() => n.navigate('M02')} />
        </View>
      </Page>
    );
  if (id === 'M02')
    return (
      <Page
        title={t('Suraksha')}
        tag="SECURE LOGIN"
        subtitle={t('GUARDIAN NETWORK \u00B7 MEMBER PORTAL')}
      >
        <Dots total={5} step={3} />
        <View style={s.row}>
          <Button
            title={t('Log In')}
            tone={!register ? 'green' : 'outline'}
            onPress={() => setRegister(false)}
          />
          <Button
            title={t('Register')}
            tone={register ? 'green' : 'outline'}
            onPress={() => setRegister(true)}
          />
        </View>
        <Input
          label={t('NIC NUMBER')}
          value={form.login}
          onChange={(login) => setForm({ ...form, login })}
        />
        <Input
          label={t('PHONE NUMBER')}
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
          keyboardType="phone-pad"
        />
        {!register && (
          <Input
            label={t('PASSWORD')}
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
            secure
          />
        )}
        <Button
          title={t('Continue \u276F')}
          onPress={async () => {
            if (register) {
              session.setNic(form.login);
              n.navigate('M03');
              return;
            }
            const result = await api('/auth/login', 'POST', {
              login: form.login,
              password: form.password,
            });
            if (result.user.role !== 'USER') throw new Error('Staff accounts use the web console');
            await saveSession(result);
            session.setUser(result.user);
            session.setLocked(true);
          }}
        />
        <Button
          title={t('Register with your NIC in one step')}
          tone="outline"
          onPress={() => setRegister(true)}
        />
        <Trust />
      </Page>
    );
  if (id === 'M03')
    return (
      <Page
        title={t('Choose your language')}
        tag="QUICK SETUP"
        subtitle={t('SINHALA \u00B7 TAMIL \u00B7 ENGLISH')}
      >
        <Dots total={4} />
        {[
          ['si', 'Sinhala · සිංහල'],
          ['ta', 'Tamil · தமிழ்'],
          ['en', 'English'],
        ].map(([code, label]) => (
          <Choice
            key={code}
            label={label!}
            selected={locale === code}
            onPress={() => setLocale(code!)}
          />
        ))}
        {locale !== 'en' && (
          <Text style={s.muted}>
            {t('Verified translations are not supplied. English content will be shown.')}
          </Text>
        )}
        <Button
          title={t('Continue \u276F')}
          onPress={async () => {
            if (session.user) {
              const u = await api('/me/preferences', 'PATCH', { locale });
              session.setUser(u);
              n.goBack();
            } else n.navigate('M04', { locale });
          }}
        />
        <Trust />
      </Page>
    );
  if (['M04', 'M05', 'M06'].includes(id)) {
    const index = Number(id.slice(1)) - 4;
    const titles = [
      'One tap. Instant help.',
      'Your evidence, encrypted.',
      'Always someone watching over you.',
    ];
    const descriptions = [
      'A deliberate SOS trigger records your location and alerts your support network when a delivery provider is connected.',
      'Store screenshots, audio and location securely, hidden from casual access on your phone.',
      'Verified staff work together across reporting, legal guidance and counseling. This prototype does not provide a live 24/7 response network.',
    ];
    return (
      <Page title={t('')} tag="ONBOARDING">
        <Pressable onPress={() => n.navigate('M07', route.params)}>
          <Text style={[s.link, { textAlign: 'right' }]}>{t('Skip')}</Text>
        </Pressable>
        <Text style={s.hero}>{['♢', '♙', '◎'][index]}</Text>
        <Text style={s.title}>{titles[index]}</Text>
        <Text style={s.subtitle}>{descriptions[index]}</Text>
        <Dots step={index + 1} />
        <Button
          title={id === 'M06' ? 'Get started ❯' : 'Next ❯'}
          onPress={() =>
            n.navigate(id === 'M06' ? 'M07' : id === 'M04' ? 'M05' : 'M06', route.params)
          }
        />
      </Page>
    );
  }
  if (id === 'M07')
    return (
      <Page title={t('Create your account')} tag="SECURE SIGNUP" subtitle={t('ACCOUNT SETUP')}>
        <Dots total={5} step={3} />
        <Input
          label={t('FULL NAME')}
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
        />
        <Input
          label={t('MOBILE NUMBER')}
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
          keyboardType="phone-pad"
        />
        <Input
          label={t('PASSWORD')}
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
          secure
        />
        <Text style={s.muted}>{t('Use 8+ characters with a number & symbol.')}</Text>
        <Choice
          label={t('I agree to the prototype privacy notice and confirm I am 16 or older.')}
          selected={consent}
          onPress={() => setConsent(!consent)}
        />
        <Text style={s.muted}>
          {t(
            'Data is stored for your chosen safety and support workflows. This is a research prototype. Full reviewed Terms and Privacy Policy are not yet supplied; do not enter real sensitive data in this development deployment.',
          )}
        </Text>
        <Button
          title={t('Create account')}
          onPress={async () => {
            const result = await api('/auth/register', 'POST', {
              name: form.name,
              phone: form.phone,
              password: form.password,
              nic: session.nic,
              consent,
            });
            await saveSession(result);
            session.setUser(result.user);
            session.setLocked(false);
            await api('/me/preferences', 'PATCH', { locale: route.params?.locale || 'en' });
          }}
        />
        <Button
          title={t('Already have an account? Sign in')}
          tone="outline"
          onPress={() => n.navigate('M02')}
        />
        <Trust />
      </Page>
    );
  if (id === 'M08')
    return (
      <Page
        title={t('Secure your app')}
        tag="APP LOCK"
        subtitle={t('Set a 6-digit PIN. You can also enable fingerprint unlock.')}
      >
        {session.user?.hasPin && (
          <Input
            label={t('Current PIN')}
            value={currentPin}
            onChange={setCurrentPin}
            keyboardType="numeric"
            secure
          />
        )}
        <PinPad label={t('6-digit PIN')} value={pin} onChange={setPin} />
        <PinPad label={t('Confirm PIN')} value={confirm} onChange={setConfirm} />
        <Card>
          <View style={s.row}>
            <Text style={[s.text, { flex: 1 }]}>{t('Fingerprint unlock')}</Text>
            <Switch
              accessibilityLabel={t('Fingerprint unlock')}
              value={biometric}
              onValueChange={async (v) => {
                if (v && !(await LocalAuthentication.hasHardwareAsync())) {
                  Alert.alert('Biometrics unavailable');
                  return;
                }
                setBiometric(v);
              }}
            />
          </View>
        </Card>
        <Button
          title={t('Confirm PIN \u276F')}
          onPress={async () => {
            if (pin !== confirm) throw new Error('PINs do not match');
            await api('/me/security/pin', 'POST', { pin, ...(currentPin ? { currentPin } : {}) });
            await api('/me/preferences', 'PATCH', { biometricEnabled: biometric });
            session.setUser({ ...session.user!, hasPin: true, biometricEnabled: biometric });
            session.setLocked(false);
            n.navigate('M09');
          }}
        />
        <Trust />
      </Page>
    );
  if (id === 'M09')
    return (
      <Page
        title={t('Choose your disguise')}
        tag="DISGUISE MODE"
        subtitle={t('CALCULATOR \u00B7 NOTES \u00B7 WEATHER')}
      >
        <Dots total={4} step={3} />
        {['calculator', 'notes', 'weather'].map((x) => (
          <Choice
            key={x}
            label={x[0]!.toUpperCase() + x.slice(1)}
            detail={
              x === 'calculator' ? 'Opens as a working calculator' : 'Internal utility disguise'
            }
            selected={disguise === x}
            onPress={() => setDisguise(x)}
          />
        ))}
        <Button
          title={t('Set disguise \u276F')}
          onPress={async () => {
            const native = await disguiseProvider.set(
              disguise as 'calculator' | 'notes' | 'weather',
            );
            const u = await api('/me/preferences', 'PATCH', { disguise });
            if (!native.launcherChanged) Alert.alert('Disguise', native.notice);
            session.setUser(u);
            n.navigate('M15');
          }}
        />
        <Text style={s.muted}>
          {t(
            'Internal disguise is available. Android launcher aliases require a native build; iOS launcher changes are not configured.',
          )}
        </Text>
        <Trust />
      </Page>
    );
  if (id === 'M10')
    return (
      <Page title={t('Guardian mode')}>
        <PinPad label={t('6-digit PIN')} value={pin} onChange={setPin} />
        <Button
          title={t('Continue to Suraksha')}
          onPress={async () => {
            await api('/me/security/unlock', 'POST', { pin });
            session.setLocked(false);
            n.navigate('M12');
          }}
        />
        <Button
          title={t('Back to calculator')}
          tone="outline"
          onPress={() => session.setLocked(true)}
        />
      </Page>
    );
  return (
    <Page title={t('Settings')} tag="SETTINGS" nav navigation={n}>
      <Card onPress={() => n.navigate('M03')}>
        <Text style={s.text}>{t('Language')}</Text>
        <Text style={s.muted}>{session.user?.locale}</Text>
      </Card>
      <Card onPress={() => n.navigate('M08')}>
        <Text style={s.text}>{t('App lock & disguise mode')}</Text>
        <Text style={s.muted}>{t('PIN + fingerprint')}</Text>
      </Card>
      <Card onPress={() => n.navigate('M09')}>
        <Text style={s.text}>{t('Choose your disguise')}</Text>
      </Card>
      <Card onPress={() => n.navigate('M16')}>
        <Text style={s.text}>{t('Location sharing defaults')}</Text>
        <Text style={s.muted}>{t('Trusted contacts only')}</Text>
      </Card>
      <Card>
        <View style={s.row}>
          <Text style={[s.text, { flex: 1 }]}>{t('Notifications')}</Text>
          <Switch
            accessibilityLabel={t('Notifications')}
            value={session.user?.notificationsEnabled}
            onValueChange={async (notificationsEnabled) =>
              session.setUser(
                await api('/me/preferences', 'PATCH', {
                  notificationsEnabled: notificationsEnabled
                    ? await deviceNotifications.requestPermission()
                    : false,
                }),
              )
            }
          />
        </View>
      </Card>
      <Card>
        <Text style={s.text}>{t('About Suraksha')}</Text>
        <Text style={s.muted}>{t('Version 0.1.0 \u00B7 Research prototype')}</Text>
      </Card>
      <Button
        title={t('Lock and disguise')}
        tone="outline"
        onPress={() => session.setLocked(true)}
      />
      <Button title={t('Delete my data')} tone="red" onPress={() => setDeleting(true)} />
      {deleting && (
        <Card>
          <Text style={s.text}>
            {t(
              'Permanently erase your account, vault and messages. This cannot be undone. Anonymous operational audit records remain.',
            )}
          </Text>
          <Input
            label={t('Type DELETE EVERYTHING')}
            value={confirmation}
            onChange={setConfirmation}
          />
          <Button
            title={t('Delete everything')}
            tone="red"
            onPress={async () => {
              await api('/me', 'DELETE', { confirmation });
              await signOut();
              session.setUser(null);
            }}
          />
          <Button title={t('Cancel')} tone="outline" onPress={() => setDeleting(false)} />
        </Card>
      )}
      <Button
        title={t('Sign out')}
        tone="outline"
        onPress={async () => {
          await signOut();
          session.setUser(null);
        }}
      />
    </Page>
  );
}
