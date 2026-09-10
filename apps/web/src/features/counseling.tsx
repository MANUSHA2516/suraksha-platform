'use client';
import { t } from '@suraksha/shared';

import { useState } from 'react';
import { api, useData } from '../lib/api';
import { Title, Card, Metrics, State, Field, Action, Badge, Tabs } from '../components/ui';

function weekAgo() {
  return Date.now() - 7 * 86400000;
}

function completedThisWeek(sessions: any[]) {
  const start = weekAgo();
  return sessions.filter(
    (x) => x.status === 'COMPLETED' && Date.parse(x.startsAt) >= start,
  ).length;
}

export function CounselingDashboard({ messagesOnly = false }: { messagesOnly?: boolean }) {
  const q = useData<any[]>('/counseling/appointments');
  const [selected, setSelected] = useState('');
  const [body, setBody] = useState('');
  const messages = useData<any[]>(selected ? `/counseling/sessions/${selected}/messages` : null);
  const today = new Date().toDateString();
  const sessions = q.data || [];
  const doneThisWeek = completedThisWeek(sessions);
  const progressMax = Math.max(doneThisWeek, sessions.length || 1);
  return (
    <>
      <Title
        title={messagesOnly ? 'Messages' : 'Today’s sessions'}
        subtitle={t('Counseling care \u00B7 confidential workspace')}
      />
      <Metrics
        items={[
          [
            'Sessions today',
            sessions.filter((x) => new Date(x.startsAt).toDateString() === today).length,
          ],
          ['Active clients', new Set(sessions.map((x) => x.clientAlias)).size],
          ['Unread messages', 'Unavailable'],
          ['Completed this week', doneThisWeek],
        ]}
      />
      {!messagesOnly && (
        <Card title={t('Weekly progress')}>
          <progress value={doneThisWeek} max={progressMax} />
          <p>
            {doneThisWeek} of {progressMax} sessions
          </p>
          <p className="muted">{t('Target not configured')}</p>
        </Card>
      )}
      <div className="two-col">
        <Card title={messagesOnly ? 'Choose a client session' : 'Today’s Sessions'}>
          <State {...q} retry={q.reload} empty={!sessions.length} />
          {sessions.map((a) => (
            <div className="queue-row" key={a.id}>
              <div>
                <a href={'/counselor/clients/' + a.id}>{a.clientAlias}</a>
                <small>
                  {new Date(a.startsAt).toLocaleString()}
                  {t('\u00B7')}
                  {a.modality}
                </small>
                <Badge>{a.concern}</Badge>
              </div>
              <div className="actions">
                <a className="button secondary" href={'/counselor/clients/' + a.id}>
                  {t('View')}
                </a>
                <button onClick={() => setSelected(a.id)}>{t('Message')}</button>
              </div>
            </div>
          ))}
        </Card>
        <Card title={t('Session Messages')}>
          {!selected ? (
            <p>{t('Select a session to view its private messages.')}</p>
          ) : (
            <>
              <State {...messages} retry={messages.reload} />
              {messages.data?.map((m) => (
                <p className="message" key={m.id}>
                  <small>{m.role}</small>
                  {m.body}
                </p>
              ))}
              <Field label={t('Message')}>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} />
              </Field>
              <Action
                label={t('Send')}
                onClick={async () => {
                  await api(`/counseling/sessions/${selected}/messages`, 'POST', { body });
                  setBody('');
                  await messages.reload();
                }}
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
}

export function ClientList() {
  const q = useData<any[]>('/counseling/appointments');
  const sessions = q.data || [];
  const clients = [
    ...sessions
      .reduce((map, a) => {
        if (!map.has(a.clientAlias)) map.set(a.clientAlias, a);
        return map;
      }, new Map<string, any>())
      .values(),
  ];
  return (
    <>
      <Title title={t('Clients')} subtitle={t('Counseling care \u00B7 confidential workspace')} />
      <Metrics
        items={[
          ['Active clients', clients.length],
          ['Sessions on record', sessions.length],
          ['Completed this week', completedThisWeek(sessions)],
          ['Unread messages', 'Unavailable'],
        ]}
      />
      <Card title={t('Client list')}>
        <State {...q} retry={q.reload} empty={!clients.length} />
        {clients.map((a) => (
          <div className="queue-row" key={a.clientAlias}>
            <div>
              <a href={'/counselor/clients/' + a.id}>{a.clientAlias}</a>
              <small>
                {new Date(a.startsAt).toLocaleString()}
                {t('\u00B7')}
                {a.modality}
              </small>
              <Badge>{a.concern}</Badge>
            </div>
            <a className="button secondary" href={'/counselor/clients/' + a.id}>
              {t('View')}
            </a>
          </div>
        ))}
      </Card>
    </>
  );
}

export function ClientSnapshot({ id }: { id: string }) {
  const q = useData('/counseling/clients/' + id);
  if (!q.data) return <State {...q} retry={q.reload} />;
  const c = q.data;
  return (
    <>
      <a href="/counselor/sessions">{t('\u2039 Back to Sessions')}</a>
      <Title title={c.clientAlias}>
        <Badge>{t('Anonymous client')}</Badge>
      </Title>
      <div className="detail-grid">
        <div>
          <Card title={t('Client snapshot')}>
            <Metrics
              items={[
                ['Prior sessions', c.history.length],
                ['Screening score', 'Not calculated'],
              ]}
            />
            <p>
              {c.screening
                ? `Consented check-in: ${c.screening.answer}`
                : 'No screening shared. Booking does not grant access to private screening.'}
            </p>
          </Card>
          <Card title={t('Session history')}>
            {c.history.map((h: any) => (
              <div className="queue-row" key={h.id}>
                <div>
                  <strong>
                    {h.modality}
                    {t('\u00B7')}
                    {h.status}
                  </strong>
                  <small>{new Date(h.startsAt).toLocaleString()}</small>
                  {h.notes.map((n: any) => (
                    <div key={n.id}>
                      <p>{n.summary}</p>
                      <Badge tone="amber">{n.risk}</Badge> {n.cadence}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
          <Card title={t('Care notes')}>
            <p>{t('Clinical notes remain restricted to the assigned counselor.')}</p>
            <a className="button" href={`/counselor/sessions/${id}/notes`}>
              {t('Add session notes')}
            </a>
          </Card>
        </div>
        <Card title={t('Client details')}>
          <p>{c.clientAlias}</p>
          <p>{new Date(c.startsAt).toLocaleString()}</p>
          <Badge>{c.status}</Badge>
          <div className="stack">
            <Action
              label={t('Start session')}
              onClick={async () => {
                await api(`/counseling/sessions/${id}/start`, 'POST');
                await q.reload();
              }}
            />
            <a className="button secondary" href="/counselor/messages">
              {t('Open secure messages')}
            </a>
            <Action
              secondary
              danger
              label={t('Escalate to crisis team')}
              onClick={async () => {
                const result = await api(`/counseling/sessions/${id}/escalate`, 'POST');
                window.alert(result.notice);
              }}
            />
          </div>
          <p className="muted">{t('Video and external crisis dispatch are not connected.')}</p>
        </Card>
      </div>
    </>
  );
}

export function SessionNotes({ id }: { id: string }) {
  const q = useData('/counseling/clients/' + id);
  const slots = useData<any[]>('/counselors/availability');
  const [summary, setSummary] = useState('');
  const [cadence, setCadence] = useState('Weekly');
  const [cadenceNote, setCadenceNote] = useState('');
  const [risk, setRisk] = useState('Mid');
  const [nextSlotId, setNextSlotId] = useState('');
  return (
    <div className="narrow">
      <a href={'/counselor/clients/' + id}>{t('\u2039 Back to client')}</a>
      <Title
        title={t('Session notes & follow-up')}
        subtitle={q.data?.clientAlias || 'Confidential session'}
      />
      <Card>
        <State {...q} retry={q.reload} />
        <Field label={t('Session summary')}>
          <textarea rows={5} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </Field>
        <Field label={t('Follow-up cadence')}>
          <Tabs
            options={['One-time', 'Weekly', 'Biweekly', 'Monthly']}
            value={cadence}
            onChange={setCadence}
          />
        </Field>
        <Field label={t('Cadence detail')}>
          <input value={cadenceNote} onChange={(e) => setCadenceNote(e.target.value)} />
        </Field>
        <Field label={t('Updated risk assessment')}>
          <Tabs options={['Low', 'Mid', 'Moderate', 'High']} value={risk} onChange={setRisk} />
        </Field>
        <Field label={t('Next session')}>
          <select value={nextSlotId} onChange={(e) => setNextSlotId(e.target.value)}>
            <option value="">{t('No follow-up reservation')}</option>
            {slots.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.startsAt).toLocaleString()}
                {t('\u00B7')}
                {s.counselor.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="actions">
          <a className="button secondary" href={'/counselor/clients/' + id}>
            {t('Cancel')}
          </a>
          <Action
            label={t('Save & schedule follow-up')}
            onClick={async () => {
              await api(`/counseling/sessions/${id}/notes`, 'POST', {
                summary,
                cadence,
                cadenceNote,
                risk,
                ...(nextSlotId ? { nextSlotId } : {}),
              });
              window.location.assign('/counselor/clients/' + id);
            }}
          />
        </div>
      </Card>
    </div>
  );
}
