'use client';
import { t } from '@suraksha/shared';

import { useState } from 'react';
import { api, useData } from '../lib/api';
import { Title, Card, Metrics, State, Field, Action, Badge } from '../components/ui';
import { readable } from '@suraksha/shared';
export function LegalDashboard({ impactOnly = false }: { impactOnly?: boolean }) {
  const q = useData<any[]>('/legal/queries');
  const resources = useData<any[]>('/legal/resources');
  const [selected, setSelected] = useState('');
  const [body, setBody] = useState('');
  const detail = useData(selected ? '/legal/queries/' + selected : null);
  return (
    <>
      <Title
        title={impactOnly ? 'Monthly Impact' : 'Legal queries'}
        subtitle={t('Guidance and human support')}
      />
      <Metrics
        items={[
          ['Open queries', q.data?.filter((x) => x.status !== 'ANSWERED').length || 0],
          ['Answered', q.data?.filter((x) => x.status === 'ANSWERED').length || 0],
          ['Avg response time', 'Not measured'],
          ['Resources published', resources.data?.filter((x) => x.published).length || 0],
        ]}
      />
      <div className="two-col">
        <Card title={t('Query Queue')}>
          <State {...q} retry={q.reload} empty={!q.data?.length} />
          {q.data?.map((x) => (
            <div className="queue-row" key={x.id}>
              <div>
                <strong>{x.title}</strong>
                <small>
                  {t('Submitted')}
                  {new Date(x.createdAt).toLocaleString()}
                </small>
              </div>
              <Badge>{readable(x.status)}</Badge>
              <button onClick={() => setSelected(x.id)}>
                {x.status === 'NEW' ? 'Respond' : 'Continue'}
              </button>
            </div>
          ))}
        </Card>
        <Card title={t('Resource Library')}>
          {resources.data?.map((x) => (
            <p key={x.id}>
              <a href="/legal/resources">{x.title}</a>
              <small>
                {x.views}
                {t('views \u00B7')}
                {x.published ? 'Published' : 'Draft'}
              </small>
            </p>
          ))}
          <a href="/legal/resources">{t('Manage resources \u2192')}</a>
          <p className="muted">
            {t('Impact counts reflect this database, not external research outcomes.')}
          </p>
        </Card>
      </div>
      {selected && (
        <Card title={detail.data?.title || 'Legal response'}>
          <State {...detail} retry={detail.reload} />
          {detail.data?.messages.map((m: any) => (
            <p className="message" key={m.id}>
              <small>{readable(m.role)}</small>
              {m.body}
            </p>
          ))}
          {!detail.data?.assigned ? (
            <Action
              label={t('Claim query')}
              onClick={async () => {
                await api('/legal/queries/' + selected, 'PATCH');
                await detail.reload();
                await q.reload();
              }}
            />
          ) : (
            <>
              <Field label={t('Response to user')}>
                <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
              </Field>
              <Action
                label={t('Send response')}
                onClick={async () => {
                  await api(`/legal/queries/${selected}/messages`, 'POST', { body });
                  setBody('');
                  await detail.reload();
                  await q.reload();
                }}
              />
            </>
          )}
        </Card>
      )}
    </>
  );
}
const blank = {
  title: '',
  body: '',
  language: 'en',
  sourceUrl: '',
  published: false,
  reviewed: false,
  readMinutes: 5,
};
export function LegalResources() {
  const q = useData<any[]>('/legal/resources');
  const [id, setId] = useState('');
  const [form, setForm] = useState(blank);
  return (
    <>
      <Title
        title={t('Legal Resource Library')}
        subtitle={t('Reviewed guides for Know Your Rights')}
      >
        <button
          onClick={() => {
            setId('');
            setForm(blank);
          }}
        >
          {t('New resource')}
        </button>
      </Title>
      <div className="two-col">
        <Card title={t('Resources')}>
          <State {...q} retry={q.reload} />
          {q.data?.map((x) => (
            <div className="queue-row" key={x.id}>
              <div>
                <strong>{x.title}</strong>
                <small>
                  {x.language}
                  {t('\u00B7 version')}
                  {x.version}
                </small>
                <Badge>{x.published ? 'Published' : 'Draft'}</Badge>
              </div>
              <button
                className="secondary"
                onClick={() => {
                  setId(x.id);
                  setForm({
                    title: x.title,
                    body: x.body,
                    language: x.language,
                    sourceUrl: x.sourceUrl || '',
                    published: x.published,
                    reviewed: !!x.reviewedAt,
                    readMinutes: x.readMinutes,
                  });
                }}
              >
                {t('Edit')}
              </button>
            </div>
          ))}
        </Card>
        <Card title={id ? 'Edit resource' : 'Create resource'}>
          <Field label={t('Title')}>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label={t('Language')}>
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              {['en', 'si', 'ta'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label={t('Reviewed legal content')}>
            <textarea
              rows={8}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </Field>
          <Field label={t('Source URL')}>
            <input
              type="url"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
            />
          </Field>
          <Field label={t('Reading minutes')}>
            <input
              type="number"
              min={1}
              max={60}
              value={form.readMinutes}
              onChange={(e) => setForm({ ...form, readMinutes: Number(e.target.value) })}
            />
          </Field>
          <label className="check">
            <input
              type="checkbox"
              checked={form.reviewed}
              onChange={(e) => setForm({ ...form, reviewed: e.target.checked })}
            />
            {t('I have reviewed this source and content')}
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            {t('Publish to Know Your Rights')}
          </label>
          <Action
            label={t('Save resource')}
            onClick={async () => {
              await api('/legal/resources' + (id ? '/' + id : ''), id ? 'PATCH' : 'POST', {
                ...form,
                sourceUrl: form.sourceUrl || undefined,
              });
              await q.reload();
            }}
          />
        </Card>
      </div>
    </>
  );
}
