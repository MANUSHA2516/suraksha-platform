import { t } from '@suraksha/shared';
import React, { useState } from 'react';
import { Text } from 'react-native';
import { api, useData } from '../lib/api';
import { ScreenProps } from '../lib/context';
import { Page, Card, Button, Choice, Input, State, s } from '../components/ui';
export function WellbeingScreen({ navigation: n, route }: ScreenProps) {
  const id = route.name;
  const [answer, setAnswer] = useState('Several days');
  const [slot, setSlot] = useState('');
  const [shared, setShared] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [body, setBody] = useState('');
  const result = useData(
    id === 'M30' && route.params?.id ? '/wellbeing/check-ins/' + route.params.id : null,
  );
  const slots = useData<any[]>(id === 'M31' ? '/counselors/availability' : null);
  const appointments = useData<any[]>(id === 'M31' ? '/counseling/appointments' : null);
  const messages = useData<any[]>(
    appointment ? `/counseling/sessions/${appointment.id}/messages` : null,
  );
  if (id === 'M29')
    return (
      <Page
        title={t('How are you, really?')}
        tag="WELLNESS CHECK"
        subtitle={t('A private, non-diagnostic check-in')}
      >
        <Text style={s.muted}>
          {t('Documented prompt \u00B7 full screening instrument not configured')}
        </Text>
        <Text style={s.section}>{t('I have felt tense or on edge this week')}</Text>
        {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((x) => (
          <Choice key={x} label={x} selected={answer === x} onPress={() => setAnswer(x)} />
        ))}
        <Button
          title={t('Save check-in \u276F')}
          tone="blue"
          onPress={async () => {
            const item = await api('/wellbeing/check-ins', 'POST', { answer, shared: false });
            n.replace('M30', { id: item.id });
          }}
        />
        <Text style={s.muted}>
          {t(
            'This is not a diagnosis. Your result remains private unless you choose to share it with your assigned counselor.',
          )}
        </Text>
      </Page>
    );
  if (id === 'M30')
    return (
      <Page
        title={t('Your check-in result')}
        tag="SCREENING COMPLETE"
        subtitle={t('Your private wellbeing record')}
      >
        <State query={result} />
        <Card style={{ backgroundColor: '#fff5e1' }}>
          <Text style={s.section}>{t('Check-in saved')}</Text>
          <Text style={s.text}>{result.data?.answer}</Text>
          <Text style={s.muted}>{result.data?.notice}</Text>
        </Card>
        <Choice
          label={t('Share this check-in with my assigned counselor')}
          selected={shared || result.data?.shared === true}
          onPress={async () => {
            const next = !(shared || result.data?.shared === true);
            await api('/wellbeing/check-ins/' + route.params.id, 'PATCH', { shared: next });
            setShared(next);
            await result.refetch();
          }}
        />
        <Button title={t('Book a counselor')} onPress={() => n.navigate('M31')} />
        <Text style={s.muted}>
          {t(
            'You can check in again in two weeks. There is no automatic diagnosis or clinical severity score.',
          )}
        </Text>
      </Page>
    );
  return (
    <Page title={t('Book a session')} tag="BOOK SESSION" subtitle={t('Choose a counselor & time')}>
      <State query={slots} />
      {slots.data?.map((x) => (
        <Choice
          key={x.id}
          label={x.counselor.name}
          detail={`${x.counselor.staff?.specialization || 'Counseling'} · ${x.counselor.staff?.languages.join(', ')}\n${new Date(x.startsAt).toLocaleString()}`}
          selected={slot === x.id}
          onPress={() => setSlot(x.id)}
        />
      ))}
      {!slots.data?.length && !slots.isLoading && (
        <Text style={s.muted}>{t('No counselor slots are currently available.')}</Text>
      )}
      <Button
        title={t('Confirm booking \u2713')}
        disabled={!slot}
        onPress={async () => {
          const a = await api('/counseling/appointments', 'POST', {
            slotId: slot,
            modality: 'CHAT',
          });
          setAppointment(a);
          await slots.refetch();
          await appointments.refetch();
        }}
      />
      {appointment && (
        <Card>
          <Text style={s.text}>{t('Confidential booking confirmed')}</Text>
          <Text style={s.muted}>{new Date(appointment.startsAt).toLocaleString()}</Text>
        </Card>
      )}
      <Text style={s.section}>{t('Your sessions')}</Text>
      {appointments.data?.map((a) => (
        <Card key={a.id} onPress={() => setAppointment(a)}>
          <Text style={s.text}>{new Date(a.startsAt).toLocaleString()}</Text>
          <Text style={s.badge}>{a.status}</Text>
        </Card>
      ))}
      {appointment && (
        <>
          <Text style={s.section}>{t('Secure session messages')}</Text>
          {messages.data?.map((m) => (
            <Text key={m.id} style={s.text}>
              {m.role}
              {t(':')}
              {m.body}
            </Text>
          ))}
          <Input label={t('Message your counselor')} value={body} onChange={setBody} multiline />
          <Button
            title={t('Send')}
            onPress={async () => {
              await api(`/counseling/sessions/${appointment.id}/messages`, 'POST', { body });
              setBody('');
              await messages.refetch();
            }}
          />
        </>
      )}
      <Text style={s.muted}>
        {t('Confidential \u00B7 Free of charge. Live video is not connected.')}
      </Text>
    </Page>
  );
}
