'use client';
import { t } from '@suraksha/shared';

import { useState } from 'react';
import { api, useData } from '../lib/api';
import {
  Title,
  Card,
  Metrics,
  State,
  CaseTable,
  Field,
  Tabs,
  Badge,
  Action,
} from '../components/ui';
import { readable, percent } from '@suraksha/shared';
export function AdminOverview() {
  const q = useData('/admin/overview');
  if (!q.data) return <State {...q} retry={q.reload} />;
  const d = q.data;
  const max = Math.max(1, ...d.days.map((x: any) => x.reports + x.sos));
  return (
    <>
      <Title title={t('Overview')} subtitle={t('Platform activity \u00B7 Suraksha Admin')} />
      <Metrics
        items={[
          ['Total active users', d.users],
          ['Open reports', d.openReports],
          ['SOS today', d.sosToday],
          ['Accounts verified', percent(d.verified, d.users) + '%'],
        ]}
      />
      <p className="muted">{d.provenance}</p>
      <div className="two-col">
        <Card title={t('Weekly Activity')}>
          <div className="chart">
            {d.days.map((x: any) => (
              <div key={x.date}>
                <div
                  className="bar"
                  style={{ height: Math.max(2, ((x.reports + x.sos) / max) * 150) }}
                  title={`${x.reports} reports / ${x.sos} SOS`}
                />
                <small>{new Date(x.date).toLocaleDateString('en', { weekday: 'short' })}</small>
              </div>
            ))}
          </div>
          <p>{t('Reports and SOS volume \u00B7 last seven days')}</p>
        </Card>
        <Card title={t('Live Feed')}>
          {d.events.map((x: any) => (
            <div className="feed-item" key={x.id}>
              <i />
              {readable(x.action)}
              <small>{new Date(x.createdAt).toLocaleTimeString()}</small>
            </div>
          ))}
          <State empty={!d.events.length} />
        </Card>
      </div>
      <Card title={t('Recent Incidents')}>
        <CaseTable rows={d.incidents} prefix="/admin" />
      </Card>
    </>
  );
}
export function UserManagement() {
  const q = useData<any[]>('/admin/users');
  const [tab, setTab] = useState('All users');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    name: '',
    login: '',
    password: '',
    role: 'POLICE',
    jurisdiction: 'Colombo',
  });
  const rows = (q.data || []).filter(
    (u) => tab === 'All users' || (tab === 'Pending' && !u.verified) || u.role === tab,
  );
  return (
    <>
      <Title title={t('User Management')} subtitle={t('Accounts and professional verification')}>
        <button onClick={() => setShow(!show)}>{t('\uFF0B Add User')}</button>
      </Title>
      <Metrics
        items={[
          ['Total users', q.data?.length || 0],
          ['Verified', q.data?.filter((u) => u.verified).length || 0],
          ['Pending review', q.data?.filter((u) => !u.verified).length || 0],
          ['Suspended', q.data?.filter((u) => u.status === 'SUSPENDED').length || 0],
        ]}
      />
      {show && (
        <Card title={t('Provision staff account')}>
          <div className="form-grid">
            {(['name', 'login', 'password', 'jurisdiction'] as const).map((key) => (
              <Field key={key} label={readable(key)}>
                <input
                  type={key === 'password' ? 'password' : 'text'}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </Field>
            ))}
            <Field label={t('Role')}>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {['POLICE', 'COUNSELOR', 'LEGAL_ADVISOR', 'ADMIN'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
          <p>{t('New staff accounts require verification before sign-in.')}</p>
          <Action
            label={t('Create pending account')}
            onClick={async () => {
              await api('/admin/users', 'POST', form);
              setShow(false);
              await q.reload();
            }}
          />
        </Card>
      )}
      <Card>
        <Tabs
          options={['All users', 'USER', 'POLICE', 'COUNSELOR', 'LEGAL_ADVISOR', 'Pending']}
          value={tab}
          onChange={setTab}
        />
        <State {...q} retry={q.reload} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('User')}</th>
                <th>{t('Role')}</th>
                <th>{t('Verification')}</th>
                <th>{t('Status')}</th>
                <th>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.name}
                    <small>{u.credentialId || 'Community account'}</small>
                  </td>
                  <td>{readable(u.role)}</td>
                  <td>
                    <Badge>{u.verified ? 'Verified' : 'Pending review'}</Badge>
                  </td>
                  <td>{u.status}</td>
                  <td className="actions">
                    <Action
                      secondary
                      label={u.verified ? 'Revoke verification' : 'Verify'}
                      onClick={async () => {
                        await api('/admin/users/' + u.id, 'PATCH', { verified: !u.verified });
                        await q.reload();
                      }}
                    />
                    <Action
                      secondary
                      label={u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      onClick={async () => {
                        await api('/admin/users/' + u.id, 'PATCH', {
                          status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                        });
                        await q.reload();
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
export function Moderation() {
  const q = useData<any[]>('/admin/moderation');
  const [tab, setTab] = useState('All flagged');
  const rows = (q.data || []).filter(
    (x) =>
      tab === 'All flagged' ||
      (tab === 'Posts' && x.post) ||
      (tab === 'Comments' && x.comment) ||
      (tab === 'User-reported' && x.source === 'USER_REPORTED'),
  );
  return (
    <>
      <Title
        title={t('Content Moderation')}
        subtitle={t('Community safety \u00B7 Suraksha Admin')}
      />
      <Metrics
        items={[
          ['Pending review', q.data?.length || 0],
          ['Posts', q.data?.filter((x) => x.post).length || 0],
          ['User-reported', q.data?.filter((x) => x.source === 'USER_REPORTED').length || 0],
          ['Automatic publication', 'Off'],
        ]}
      />
      <Card>
        <Tabs
          options={['All flagged', 'Posts', 'Comments', 'User-reported']}
          value={tab}
          onChange={setTab}
        />
        <State {...q} empty={!rows.length} retry={q.reload} />
        {rows.map((x) => (
          <article className="queue-row" key={x.id}>
            <div>
              <Badge tone="amber">{readable(x.source)}</Badge>
              <h3>{x.post ? 'Flagged post' : 'Flagged comment'}</h3>
              <p>{x.post?.body || x.comment?.body}</p>
              <small>{x.reason}</small>
            </div>
            <div className="stack">
              <Action
                label={t('Approve')}
                onClick={async () => {
                  await api('/admin/moderation/' + x.id, 'PATCH', { action: 'APPROVE' });
                  await q.reload();
                }}
              />
              <Action
                danger
                secondary
                label={t('Remove')}
                onClick={async () => {
                  await api('/admin/moderation/' + x.id, 'PATCH', { action: 'REMOVE' });
                  await q.reload();
                }}
              />
            </div>
          </article>
        ))}
      </Card>
    </>
  );
}
export function ModelMonitoring() {
  const q = useData<any[]>('/admin/models');
  const [detail, setDetail] = useState('');
  return (
    <>
      <Title
        title={t('AI Model Monitoring')}
        subtitle={t('Settings \u00B7 model provenance and audit')}
      />
      <Metrics
        items={[
          ['Validated accuracy', 'Unavailable'],
          ['False-positive rate', 'Unevaluated'],
          ['Registered models', q.data?.length || 0],
          ['Regional coverage', 'Unevaluated'],
        ]}
      />
      <div className="two-col">
        <Card title={t('Model Performance')}>
          <State {...q} retry={q.reload} />
          <table>
            <thead>
              <tr>
                <th>{t('Model')}</th>
                <th>{t('Accuracy')}</th>
                <th>{t('Drift')}</th>
                <th>{t('Provider')}</th>
              </tr>
            </thead>
            <tbody>
              {q.data?.map((m) => (
                <tr key={m.id}>
                  <td>
                    {m.name}
                    <small>{m.id}</small>
                  </td>
                  <td>{m.metrics.length ? 'See evaluation records' : 'No evaluation'}</td>
                  <td>
                    <Badge tone="amber">{readable(m.driftStatus)}</Badge>
                  </td>
                  <td>{m.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title={t('Sinhala / Tamil Coverage')}>
          {['English', 'Sinhala', 'Tamil'].map((x) => (
            <p key={x}>
              {x}
              <progress value={0} max={100} />
              <small>{t('No validated evaluation supplied')}</small>
            </p>
          ))}
        </Card>
      </div>
      <Card title={t('Recent Audit Activity')}>
        {q.data
          ?.flatMap((m) => m.events)
          .map((e: any) => (
            <p key={e.id}>
              <Badge>{e.type}</Badge> {e.detail}
            </p>
          ))}
        <Field label={t('Retraining or override review note')}>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} />
        </Field>
        <Action
          label={t('Record retraining request')}
          onClick={async () => {
            await api('/admin/model-events', 'POST', {
              modelId: q.data?.[0]?.id,
              type: 'RETRAINING_REQUESTED',
              detail,
            });
            setDetail('');
            await q.reload();
          }}
        />
        <p className="muted">
          {t('A request records intent; it does not claim that a model has been trained.')}
        </p>
      </Card>
    </>
  );
}
