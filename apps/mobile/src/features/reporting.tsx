import { t } from '@suraksha/shared';
import React, { useState } from 'react';
import { Text, View, Switch } from 'react-native';
import * as Crypto from 'expo-crypto';
import { api, useData } from '../lib/api';
import { ScreenProps } from '../lib/context';
import { Page, Card, Button, Choice, Input, State, Trust, s } from '../components/ui';
import { readable } from '@suraksha/shared';
const categories = [
  ['CYBER_HARASSMENT', 'Cyber harassment', 'Threats, blackmail, stalking'],
  ['DOMESTIC_VIOLENCE', 'Domestic violence', 'At home'],
  ['WORKPLACE_HARASSMENT', 'Workplace harassment', 'At work'],
  ['PUBLIC_TRANSPORT_ABUSE', 'Public transport abuse', 'Bus, train, tuk'],
];
export function ReportingScreen({ navigation: n, route }: ScreenProps) {
  const id = route.name;
  const [category, setCategory] = useState(route.params?.category || 'CYBER_HARASSMENT');
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [anonymous, setAnonymous] = useState(true);
  const [selected, setSelected] = useState<string[]>(route.params?.evidenceIds || []);
  const [queryId, setQueryId] = useState<string | undefined>(route.params?.queryId);
  const [search, setSearch] = useState('');
  const [resource, setResource] = useState<any>(null);
  const [commentId, setCommentId] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [requestKey] = useState(() => Crypto.randomUUID());
  const evidence = useData<any[]>(id === 'M25' ? '/evidence' : null);
  const reports = useData<any[]>(id === 'M26' && !route.params?.reference ? '/cases' : null);
  const report = useData(
    id === 'M26' && route.params?.reference ? '/cases/' + route.params.reference : null,
  );
  const messages = useData<any[]>(
    id === 'M26' && route.params?.reference ? `/cases/${route.params.reference}/messages` : null,
  );
  const query = useData(id === 'M23' && queryId ? '/legal/queries/' + queryId : null);
  const queries = useData<any[]>(id === 'M23' ? '/legal/queries' : null);
  const posts = useData<any[]>(id === 'M27' ? '/community/posts' : null);
  const resources = useData<any[]>(
    id === 'M28' ? '/legal/resources?search=' + encodeURIComponent(search) : null,
  );
  if (id === 'M23')
    return (
      <Page title={t('Legal Aid Chat')} tag="AI LEGAL AID" subtitle={t('Ask anything, anytime')}>
        <State query={query} />
        {!queryId &&
          queries.data?.map((q) => (
            <Card key={q.id} onPress={() => setQueryId(q.id)}>
              <Text style={s.text}>{q.title}</Text>
              <Text style={s.badge}>{q.status}</Text>
            </Card>
          ))}
        {query.data?.messages.map((m: any) => (
          <Card
            key={m.id}
            style={
              m.role === 'USER'
                ? { marginLeft: 30 }
                : { marginRight: 30, backgroundColor: '#edf4fb' }
            }
          >
            <Text style={s.muted}>{readable(m.role)}</Text>
            <Text style={s.text}>{m.body}</Text>
          </Card>
        ))}
        <Input
          label={t('Message \u2014 ask about your rights\u2026')}
          value={text}
          onChange={setText}
          multiline
        />
        <Button
          title={t('Send message')}
          onPress={async () => {
            if (queryId) {
              await api(`/legal/queries/${queryId}/messages`, 'POST', { body: text });
              await query.refetch();
            } else {
              const q = await api('/legal/queries', 'POST', { body: text });
              setQueryId(q.id);
            }
            setText('');
          }}
        />
        {queryId && (
          <Button
            title={query.data?.escalated ? 'Human advisor requested' : 'Connect to a human advisor'}
            tone="outline"
            disabled={query.data?.escalated}
            onPress={async () => {
              await api(`/legal/queries/${queryId}/escalate`, 'POST');
              await query.refetch();
            }}
          />
        )}
        <Button title={t('Help me file a report')} tone="blue" onPress={() => n.navigate('M24')} />
        <Text style={s.muted}>
          {t(
            'Legal information is not representation. Human responses depend on advisor availability. No unrestricted AI legal advice is generated.',
          )}
        </Text>
        <Trust />
      </Page>
    );
  if (id === 'M24')
    return (
      <Page
        title={t('What happened?')}
        tag="START REPORT · STEP 1 OF 3"
        subtitle={t('Choose the category that fits best')}
      >
        {categories.map(([value, label, detail]) => (
          <Choice
            key={value}
            label={label!}
            detail={detail}
            selected={category === value}
            onPress={() => setCategory(value)}
          />
        ))}
        <Button
          title={t('Continue \u276F')}
          tone="blue"
          onPress={() =>
            n.navigate('M25', { category, evidenceIds: route.params?.evidenceIds || [] })
          }
        />
        <Trust text="ANONYMOUS OPTION · ENCRYPTED AT REST" />
      </Page>
    );
  if (id === 'M25')
    return (
      <Page
        title={readable(category) + ' report'}
        tag="STEP 2 OF 3"
        subtitle={t('Anonymous submission available')}
      >
        <Input label={t('When did this happen? (YYYY-MM-DD)')} value={date} onChange={setDate} />
        <Text style={s.section}>{t('Attach evidence')}</Text>
        <State query={evidence} />
        {evidence.data?.map((e) => (
          <Choice
            key={e.id}
            label={e.filename}
            selected={selected.includes(e.id)}
            onPress={() =>
              setSelected(
                selected.includes(e.id) ? selected.filter((x) => x !== e.id) : [...selected, e.id],
              )
            }
          />
        ))}
        {!evidence.data?.length && (
          <Button
            title={t('Add evidence to Vault')}
            tone="outline"
            onPress={() => n.navigate('M19')}
          />
        )}
        <Input label={t('Describe briefly (optional)')} value={text} onChange={setText} multiline />
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.text}>{t('Submit anonymously')}</Text>
            <Text style={s.muted}>{t('Hide identity except from your assigned handler')}</Text>
          </View>
          <Switch
            accessibilityLabel={t('Submit anonymously')}
            value={anonymous}
            onValueChange={setAnonymous}
          />
        </View>
        <Button
          title={t('Submit report \u27A4')}
          tone="blue"
          onPress={async () => {
            const occurredAt = new Date(date);
            if (!Number.isFinite(occurredAt.getTime())) throw new Error('Enter a valid date');
            const c = await api('/reports', 'POST', {
              category,
              occurredAt: occurredAt.toISOString(),
              description: text,
              anonymous,
              evidenceIds: selected,
              idempotencyKey: requestKey,
            });
            n.replace('M26', { reference: c.reference });
          }}
        />
        <Trust />
      </Page>
    );
  if (id === 'M26') {
    if (!route.params?.reference)
      return (
        <Page title={t('My reports')} tag="CASE FOLLOW-UP" navigation={n}>
          <State query={reports} />
          {reports.data?.map((c) => (
            <Card key={c.reference} onPress={() => n.navigate('M26', { reference: c.reference })}>
              <Text style={s.text}>
                {t('Report #')}
                {c.reference}
              </Text>
              <Text style={s.badge}>{readable(c.stage)}</Text>
            </Card>
          ))}
          {!reports.data?.length && <Text style={s.muted}>{t('No reports submitted yet.')}</Text>}
        </Page>
      );
    return (
      <Page
        title={'Report #' + route.params.reference}
        tag="CASE FOLLOW-UP · STEP 3 OF 3"
        subtitle={t('Track your case progress')}
      >
        <State query={report} />
        {report.data?.events.map((event: any) => (
          <Card key={event.id}>
            <Text style={s.text}>
              {t('\u2713')}
              {event.publicText}
            </Text>
            <Text style={s.muted}>{new Date(event.createdAt).toLocaleString()}</Text>
          </Card>
        ))}
        <Text style={s.badge}>{readable(report.data?.stage || 'FILED')}</Text>
        <Button title={t('Refresh status')} tone="outline" onPress={() => report.refetch()} />
        <Text style={s.section}>{t('Message case officer')}</Text>
        {messages.data?.map((m) => (
          <Card key={m.id}>
            <Text style={s.text}>{m.body}</Text>
          </Card>
        ))}
        <Input label={t('Your message')} value={message} onChange={setMessage} multiline />
        <Button
          title={t('Send message')}
          tone="outline"
          onPress={async () => {
            await api(`/cases/${route.params.reference}/messages`, 'POST', { body: message });
            setMessage('');
            await messages.refetch();
          }}
        />
        <Trust text={'CASE #' + route.params.reference + ' · SHARED CASE RECORD'} />
      </Page>
    );
  }
  if (id === 'M27')
    return (
      <Page
        title={t('Community')}
        tag="COMMUNITY"
        subtitle={t('Moderated peer support')}
        nav
        navigation={n}
      >
        <Input
          label={t('Share your story anonymously\u2026')}
          value={text}
          onChange={setText}
          multiline
        />
        <Button
          title={t('Submit for moderation')}
          onPress={async () => {
            await api('/community/posts', 'POST', { body: text });
            setText('');
            await posts.refetch();
          }}
        />
        <State query={posts} />
        {posts.data?.map((p) => (
          <Card key={p.id}>
            <Text style={s.text}>{t('\u25CE Anonymous')}</Text>
            <Text style={s.text}>{p.body}</Text>
            <Text style={s.muted}>
              {new Date(p.createdAt).toLocaleDateString()}
              {t('\u00B7')}
              {p.status}
            </Text>
            <Text style={s.muted}>
              {t('\u2661')}
              {p._count.likes}
              {t('\u00B7 Comments')}
              {p.comments.length}
            </Text>
            {p.status === 'PUBLISHED' && (
              <>
                <View style={s.row}>
                  <Button
                    title={t('Like')}
                    tone="outline"
                    onPress={async () => {
                      await api('/community/posts/' + p.id + '/like', 'PUT');
                      await posts.refetch();
                    }}
                  />
                  <Button title={t('Comment')} tone="outline" onPress={() => setCommentId(p.id)} />
                </View>
                <Button
                  title={t('Report this post')}
                  tone="outline"
                  onPress={() =>
                    api('/community/flags', 'POST', {
                      postId: p.id,
                      reason: 'User requests moderator review',
                    })
                  }
                />
                {p.comments.map((c: any) => (
                  <Card key={c.id}>
                    <Text style={s.text}>
                      {t('Anonymous:')}
                      {c.body}
                    </Text>
                  </Card>
                ))}
                {commentId === p.id && (
                  <>
                    <Input
                      label={t('Supportive comment')}
                      value={comment}
                      onChange={setComment}
                      multiline
                    />
                    <Button
                      title={t('Submit comment')}
                      onPress={async () => {
                        await api('/community/posts/' + p.id + '/comments', 'POST', {
                          body: comment,
                        });
                        setComment('');
                        setCommentId('');
                        await posts.refetch();
                      }}
                    />
                  </>
                )}
              </>
            )}
          </Card>
        ))}
        <Trust text="ANONYMOUS DISPLAY · REVIEW BEFORE PUBLICATION" />
      </Page>
    );
  return (
    <Page
      title={t('Know your rights')}
      tag="KNOWLEDGE HUB"
      subtitle={t('Plain-language legal guides')}
      nav
      navigation={n}
    >
      <Input label={t('Search guides\u2026')} value={search} onChange={setSearch} />
      <State query={resources} />
      {resources.data?.map((r) => (
        <Card key={r.id} onPress={async () => setResource(await api('/legal/resources/' + r.id))}>
          <Text style={s.text}>
            {t('\u25A2')}
            {r.title}
          </Text>
          <Text style={s.muted}>
            {r.readMinutes}
            {t('min read \u00B7')}
            {r.language}
          </Text>
        </Card>
      ))}
      {!resources.data?.length && !resources.isLoading && (
        <Card>
          <Text style={s.text}>{t('Reviewed guides are not yet published.')}</Text>
          <Text style={s.muted}>
            {t(
              'Cyber Crimes Act, Domestic Violence Act, workplace protections and filing a police complaint are documented resource topics. Their reviewed source content has not been supplied.',
            )}
          </Text>
        </Card>
      )}
      {resource && (
        <Card>
          <Text style={s.section}>{resource.title}</Text>
          <Text style={s.text}>{resource.body}</Text>
          <Text selectable style={s.muted}>
            {t('Source:')}
            {resource.sourceUrl}
          </Text>
        </Card>
      )}
      <Button title={t('Ask Legal Aid')} onPress={() => n.navigate('M23')} />
      <Trust text="REVIEWED CONTENT ONLY" />
    </Page>
  );
}
