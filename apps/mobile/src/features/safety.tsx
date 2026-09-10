import { deviceLocation } from '../providers/location';
import { t } from '@suraksha/shared';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import { api, useData } from '../lib/api';
import { useSession, ScreenProps } from '../lib/context';
import {
  Page,
  Card,
  Button,
  Input,
  MapCard,
  State,
  Trust,
  TrustBadges,
  IconCard,
  Stepper,
  colors,
  s,
} from '../components/ui';
export const currentPosition = () => deviceLocation.current();
export function SafetyScreen({ navigation: n, route }: ScreenProps) {
  const id = route.name;
  const session = useSession();
  const home = useData(id === 'M12' ? '/me/overview' : null);
  const contacts = useData<any[]>(['M15', 'M16'].includes(id) ? '/contacts' : null);
  const alert = useData(id === 'M14' && route.params?.id ? '/sos/' + route.params.id : null);
  const shares = useData<any[]>(id === 'M16' ? '/location/shares' : null);
  const [holding, setHolding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', priority: false });
  const [position, setPosition] = useState<any>(null);
  const [shareContact, setShareContact] = useState('');
  const [destination, setDestination] = useState({ latitude: '', longitude: '' });
  const [routeResult, setRouteResult] = useState<any>(null);
  const [navigating, setNavigating] = useState(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (id !== 'M16' || !shares.data?.length) return;
    let active = true;
    let watch: Location.LocationSubscription | undefined;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 20 },
      (p) => {
        if (active)
          void api('/location/events', 'POST', {
            latitude: p.coords.latitude,
            longitude: p.coords.longitude,
            accuracy: p.coords.accuracy || 0,
            capturedAt: new Date(p.timestamp).toISOString(),
          }).catch((e) => setError(String(e)));
      },
    )
      .then((w) => {
        watch = w;
        if (!active) w.remove();
      })
      .catch((e) => setError(String(e)));
    return () => {
      active = false;
      watch?.remove();
    };
  }, [id, shares.data?.length]);
  useEffect(() => {
    if (id !== 'M14' || !['ACTIVE', 'RESPONDING'].includes(alert.data?.status)) return;
    let active = true;
    let watcher: Location.LocationSubscription | undefined;
    void Location.getForegroundPermissionsAsync()
      .then(async (permission) => {
        if (!permission.granted || !active) return;
        watcher = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 10 },
          (p) => {
            if (active)
              void api('/location/events', 'POST', {
                sosId: route.params.id,
                latitude: p.coords.latitude,
                longitude: p.coords.longitude,
                accuracy: p.coords.accuracy || 0,
                capturedAt: new Date(p.timestamp).toISOString(),
              }).catch((e) => setError(e instanceof Error ? e.message : 'Location update failed'));
          },
        );
        if (!active) watcher.remove();
      })
      .catch(() => setError('Live location is unavailable'));
    return () => {
      active = false;
      watcher?.remove();
    };
  }, [id, alert.data?.status, route.params?.id]);
  if (id === 'M12')
    return (
      <Page
        title={'Good evening, ' + (session.user?.name.split(' ')[0] || 'you')}
        tag="HOME"
        meta="DASHBOARD"
        subtitle={t('Here\u2019s your safety overview')}
        nav
        navigation={n}
      >
        <State query={home} />
        <Stepper step={3} total={5} />
        <IconCard
          title={t('SOS Emergency')}
          detail={t('Tap and hold 2s to alert')}
          icon="!"
          tone="sos"
          onPress={() => n.navigate('M13')}
        />
        <IconCard
          title={t('Evidence Vault')}
          detail={`${home.data?.evidenceCount || 0} items`}
          icon="▢"
          onPress={() => n.navigate('M18')}
        />
        <IconCard
          title={t('Ask Legal Aid')}
          detail={t('AI chat')}
          icon="♧"
          onPress={() => n.navigate('M23')}
        />
        <IconCard
          title={t('Check in')}
          detail={t('Mood screen')}
          icon="◎"
          onPress={() => n.navigate('M29')}
        />
        <IconCard
          title={t('Jobs')}
          detail={t('Entry only · catalog not specified')}
          icon="▣"
          onPress={() =>
            setError(
              'Jobs and skills screens are not specified in the source. No employment service is available.',
            )
          }
        />
        {error && <Text style={s.muted}>{error}</Text>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
          {[
            ['Scan a message', 'M21'],
            ['Start a report', 'M24'],
            ['My reports', 'M26'],
            ['Community', 'M27'],
            ['Trusted contacts', 'M15'],
            ['Sharing location', 'M16'],
            ['Route home', 'M17'],
          ].map(([label, screen]) => (
            <Pressable key={screen} accessibilityRole="button" onPress={() => n.navigate(screen)}>
              <Text style={s.link}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Trust text="DEVELOPMENT SERVICES · NO REAL EMERGENCY DISPATCH" />
      </Page>
    );
  if (id === 'M13')
    return (
      <Page
        title={t('SOS Emergency')}
        tag="EMERGENCY"
        meta="HOLD-TO-ALERT"
        subtitle={t('Press and hold to send an alert')}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 330 }}>
          <View
            style={{
              width: 230,
              height: 230,
              borderRadius: 115,
              borderWidth: 2,
              borderColor: '#ffc9c5',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 210,
                height: 210,
                borderRadius: 105,
                borderWidth: 2,
                borderColor: '#ffb0aa',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Hold for two seconds to activate SOS')}
                disabled={busy}
                onPressIn={() => {
                  setHolding(true);
                  timer.current = setTimeout(async () => {
                    timer.current = null;
                    setBusy(true);
                    setHolding(false);
                    try {
                      const location = await currentPosition();
                      const result = await api('/sos', 'POST', {
                        idempotencyKey: Crypto.randomUUID(),
                        ...location,
                      });
                      n.replace('M14', { id: result.id });
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'SOS could not be recorded');
                    } finally {
                      setBusy(false);
                    }
                  }, 2000);
                }}
                onPressOut={() => {
                  if (timer.current) clearTimeout(timer.current);
                  timer.current = null;
                  setHolding(false);
                }}
                style={{
                  width: 190,
                  height: 190,
                  borderRadius: 95,
                  backgroundColor: colors.red,
                  borderWidth: 8,
                  borderColor: holding ? '#ffaaa4' : '#ffdfdc',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ scale: holding ? 0.96 : 1 }],
                }}
              >
                <Text style={{ fontSize: 36, color: 'white' }}>{t('\u25B3')}</Text>
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                  {busy ? 'RECORDING…' : holding ? 'KEEP HOLDING' : 'HOLD\n2 SEC'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
        {error && (
          <Text accessibilityRole="alert" style={s.error}>
            {error}
          </Text>
        )}
        <Text style={s.subtitle}>
          {t('Alerts trusted contacts and nearest police unit with your live location.')}
        </Text>
        <Text style={[s.muted, { textAlign: 'center' }]}>
          {t(
            'This prototype records a development alert. No real police unit or trusted contact is contacted.',
          )}
        </Text>
        <Button
          title={t('Cancel')}
          tone="outline"
          onPress={() => {
            if (timer.current) clearTimeout(timer.current);
            n.navigate('M12');
          }}
        />
        <TrustBadges items={['LIVE LOCATION', 'ENCRYPTED']} />
      </Page>
    );
  if (id === 'M14')
    return (
      <Page
        title={t('Help is on the way')}
        tag="LIVE ALERT"
        meta="TRACKING"
        subtitle={t('Live tracking active')}
      >
        <State query={alert} />
        <MapCard
          latitude={alert.data?.locations[0]?.latitude}
          longitude={alert.data?.locations[0]?.longitude}
        />
        <Card>
          <Text style={s.text}>{t('Police unit notified')}</Text>
          <Text style={s.muted}>
            {alert.data?.responderConfirmed
              ? t('Development responder joined')
              : t('Waiting for a development responder · no live ETA')}
          </Text>
        </Card>
        <Card>
          <Text style={s.text}>
            {(alert.data?.deliveries?.length || 0) + ' ' + t('contacts alerted')}
          </Text>
          {(alert.data?.deliveries || []).map((d: any) => (
            <Text key={d.id} style={s.muted}>
              {d.recipientLabel} · {d.status.replaceAll('_', ' ')}
            </Text>
          ))}
          {!alert.data?.deliveries?.length && (
            <Text style={s.muted}>{t('No contact delivery receipts yet.')}</Text>
          )}
        </Card>
        <Text style={s.badge}>{alert.data?.status}</Text>
        <Button
          title={t('\u2713 I am safe now')}
          onPress={async () => {
            await api('/sos/' + route.params.id + '/status', 'PATCH', { status: 'SAFE' });
            await alert.refetch();
          }}
        />
        <Button title={t('Home')} tone="outline" onPress={() => n.navigate('M12')} />
        <TrustBadges items={['LIVE LOCATION', 'ENCRYPTED']} />
      </Page>
    );
  if (id === 'M15')
    return (
      <Page
        title={t('Add trusted contacts')}
        tag="TRUSTED CONTACTS"
        meta="STEP 4 OF 4"
        subtitle={t('They\u2019re prioritized during SOS')}
      >
        <Stepper step={4} total={4} label={t('Contacts')} />
        <State query={contacts} />
        {contacts.data?.map((c) => (
          <Card key={c.id}>
            <View style={s.row}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.navy,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  {c.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.text}>
                  {c.name}
                  {c.priority ? ' · PRIORITY' : ''}
                </Text>
                <Text style={s.muted}>
                  {c.relationship}
                  {t('\u00B7')}
                  {c.phone}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Remove')}
                onPress={async () => {
                  await api('/contacts/' + c.id, 'DELETE');
                  await contacts.refetch();
                }}
              >
                <Text style={{ color: colors.red, fontSize: 18 }}>×</Text>
              </Pressable>
            </View>
          </Card>
        ))}
        <Text style={s.muted}>{t('You can add more anytime in Settings.')}</Text>
        <Input
          label={t('Name')}
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
        />
        <Input
          label={t('Relationship')}
          value={form.relationship}
          onChange={(relationship) => setForm({ ...form, relationship })}
        />
        <Input
          label={t('Phone number')}
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
          keyboardType="phone-pad"
        />
        <View style={s.row}>
          <Text style={s.text}>{t('Priority contact')}</Text>
          <Switch
            accessibilityLabel={t('Priority contact')}
            value={form.priority}
            onValueChange={(priority) => setForm({ ...form, priority })}
          />
        </View>
        <Button
          title={t('\uFF0B Add another contact')}
          tone="outline"
          onPress={async () => {
            await api('/contacts', 'POST', form);
            setForm({ name: '', relationship: '', phone: '', priority: false });
            await contacts.refetch();
          }}
        />
        <Button title={t('Finish setup \u276F')} onPress={() => n.navigate('M12')} />
        <TrustBadges />
      </Page>
    );
  if (id === 'M16')
    return (
      <Page
        title={t('Sharing location')}
        tag="LOCATION SHARING"
        subtitle={t('Time-boxed sharing with trusted contacts')}
      >
        <MapCard latitude={position?.latitude} longitude={position?.longitude} />
        <State query={contacts} />
        {contacts.data?.map((c) => (
          <Card onPress={() => setShareContact(c.id)} key={c.id}>
            <Text style={s.text}>
              {shareContact === c.id ? '◉' : '○'}
              {t('Share with')}
              {c.name}
            </Text>
          </Card>
        ))}
        <Button
          title={t('Share for 2 hours')}
          onPress={async () => {
            const p = await currentPosition();
            if (!p.location || p.locationState !== 'AVAILABLE')
              throw new Error('Current location permission is required');
            setPosition(p.location);
            await api('/location/shares', 'POST', { contactId: shareContact, minutes: 120 });
            await api('/location/events', 'POST', p.location);
            await shares.refetch();
          }}
        />
        {shares.data?.map((x) => (
          <Card key={x.id}>
            <Text style={s.text}>
              {t('Sharing with')}
              {x.contact.name}
            </Text>
            <Text style={s.muted}>
              {t('Until')}
              {new Date(x.expiresAt).toLocaleTimeString()}
            </Text>
            <Button
              title={t('Stop sharing')}
              tone="outline"
              onPress={async () => {
                await api('/location/shares/' + x.id, 'DELETE');
                await shares.refetch();
              }}
            />
          </Card>
        ))}
        {error && <Text style={s.error}>{error}</Text>}
        <Text style={s.muted}>
          {t(
            'Sharing is recorded in the development backend. External contact delivery is not connected.',
          )}
        </Text>
      </Page>
    );
  return (
    <Page title={t('Route home')} tag="SAFE ROUTE" subtitle={t('Avoiding reported danger zones')}>
      <MapCard latitude={position?.latitude} longitude={position?.longitude} />
      <Input
        label={t('Destination latitude')}
        value={destination.latitude}
        onChange={(latitude) => setDestination({ ...destination, latitude })}
        keyboardType="numeric"
      />
      <Input
        label={t('Destination longitude')}
        value={destination.longitude}
        onChange={(longitude) => setDestination({ ...destination, longitude })}
        keyboardType="numeric"
      />
      <Button
        title={t('Find route')}
        tone="blue"
        onPress={async () => {
          const p = await currentPosition();
          if (!p.location) throw new Error('Current GPS location unavailable');
          setPosition(p.location);
          setRouteResult(
            await api('/routes', 'POST', {
              origin: p.location,
              destination: {
                latitude: Number(destination.latitude),
                longitude: Number(destination.longitude),
                accuracy: 0,
                capturedAt: new Date().toISOString(),
              },
            }),
          );
        }}
      />
      {routeResult && (
        <>
          <Card>
            <Text style={s.text}>{routeResult.notice}</Text>
            {routeResult.zones.map((z: any) => (
              <Text key={z.id} style={s.muted}>
                {z.label}
                {t('\u00B7')}
                {z.reportCount}
                {t('development reports')}
              </Text>
            ))}
          </Card>
          <Button
            title={navigating ? 'Stop navigation preview' : 'Start safe navigation'}
            tone="blue"
            onPress={() => setNavigating(!navigating)}
          />
          {navigating && (
            <Text style={s.error}>
              {t(
                'Preview only: live safe routing and geofenced deviation alerts require a configured routing provider.',
              )}
            </Text>
          )}
        </>
      )}
      <Trust text="DEVELOPMENT ROUTE · SAFETY NOT VALIDATED" />
    </Page>
  );
}
