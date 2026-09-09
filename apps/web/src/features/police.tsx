'use client';
import { t } from '@suraksha/shared';

import { api, useData } from '../lib/api';
import { Title, Card, Metrics, State, MapPanel, Action, Badge } from '../components/ui';
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
          ['Assigned cases', cases.data?.length || 0],
          ['Avg response time', 'Not measured'],
          ['Resolved cases', cases.data?.filter((x) => x.stage === 'RESOLVED').length || 0],
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
        <Card title={t('Alert Queue')}>
          <State {...q} retry={q.reload} empty={!q.data?.length} />
          {q.data?.map((x) => (
            <div className="alert-item" key={x.id}>
              <Badge tone="red">
                {t('SOS \u00B7')}
                {x.jurisdiction}
              </Badge>
              <p>
                {new Date(x.createdAt).toLocaleString()}
                {t('\u00B7')}
                {x.locationState}
              </p>
              <p>{x.status}</p>
              {x.status === 'ACTIVE' && (
                <Action
                  danger
                  label={t('Respond')}
                  onClick={async () => {
                    await api(`/sos/${x.id}/respond`, 'POST');
                    await q.reload();
                  }}
                />
              )}
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
