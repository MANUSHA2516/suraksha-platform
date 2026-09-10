'use client';
import { t } from '@suraksha/shared';

import { api, useData } from '../lib/api';
import { Title, Card, Metrics, State, MapPanel, Action, Badge } from '../components/ui';

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function elapsed(iso: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function resolvedTodayCount(cases: any[]) {
  const resolved = cases.filter((x) => x.stage === 'RESOLVED');
  if (!resolved.length) return 0;
  const dated = resolved.filter((x) => x.updatedAt || x.resolvedAt || x.createdAt);
  if (!dated.length) return resolved.length;
  return dated.filter((x) => isToday(x.updatedAt || x.resolvedAt || x.createdAt)).length;
}

function AlertQueue({
  data,
  loading,
  error,
  reload,
}: {
  data: any[] | null;
  loading?: boolean;
  error?: string;
  reload: () => Promise<unknown> | void;
}) {
  return (
    <Card title={t('Alert Queue')}>
      <State loading={loading} error={error} retry={reload} empty={!data?.length} />
      {data?.map((x) => (
        <div className="alert-item" key={x.id}>
          <Badge tone="red">
            {t('SOS \u00B7')}
            {x.jurisdiction}
          </Badge>
          <p>
            {elapsed(x.createdAt)}
            {t('\u00B7')}
            {x.locationState}
          </p>
          <p>{x.status}</p>
          {x.status === 'ACTIVE' ? (
            <Action
              danger
              label={t('Respond')}
              onClick={async () => {
                await api(`/sos/${x.id}/respond`, 'POST');
                await reload();
              }}
            />
          ) : x.caseReference ? (
            <a className="button secondary" href={'/police/cases/' + x.caseReference}>
              {t('View case')}
            </a>
          ) : null}
        </div>
      ))}
    </Card>
  );
}

export function PoliceLive() {
  const q = useData<any[]>('/police/alerts');
  const cases = useData<any[]>('/cases');
  return (
    <>
      <Title title={t('Active Alerts')} subtitle={t('Live SOS map \u00B7 authorized jurisdiction')}>
        <Badge tone="red">{t('LIVE')}</Badge>
      </Title>
      <Metrics
        items={[
          ['Active SOS', q.data?.length || 0],
          ['Assigned to me', cases.data?.length || 0],
          ['Avg response time', 'Not measured'],
          ['Resolved today', resolvedTodayCount(cases.data || [])],
        ]}
      />
      <div className="two-col">
        <Card title={t('Live SOS Map')}>
          <MapPanel positions={q.data?.flatMap((x) => x.locations.slice(0, 1)) || []} />
          <p className="muted">
            {t(
              'Development coordinate view. No live unit locations or emergency dispatch integration.',
            )}
          </p>
        </Card>
        <AlertQueue data={q.data} loading={q.loading} error={q.error} reload={q.reload} />
      </div>
    </>
  );
}

export function PoliceMap() {
  const q = useData<any[]>('/police/alerts');
  return (
    <>
      <Title title={t('SOS Map')} subtitle={t('Jurisdiction alerts \u00B7 coordinate view only')}>
        <Badge tone="red">{t('LIVE')}</Badge>
      </Title>
      <Card title={t('SOS Map')}>
        <MapPanel positions={q.data?.flatMap((x) => x.locations.slice(0, 1)) || []} />
        <p className="muted">
          {t(
            'Development coordinate view. No live unit locations or emergency dispatch integration.',
          )}
        </p>
      </Card>
      <AlertQueue data={q.data} loading={q.loading} error={q.error} reload={q.reload} />
    </>
  );
}
