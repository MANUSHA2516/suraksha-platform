import { t } from '@suraksha/shared';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export const colors = {
  ink: '#10213a',
  navy: '#153d7a',
  green: '#09a878',
  blue: '#175bcc',
  pale: '#f4f8fb',
  line: '#dce6ee',
  muted: '#6b8197',
  red: '#ef453d',
};
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: 'white' },
  scroll: { padding: 24, paddingTop: 20, flexGrow: 1 },
  tag: {
    color: '#048765',
    backgroundColor: '#e5f8f0',
    fontSize: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.pale,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { fontSize: 14, color: colors.ink, lineHeight: 22 },
  muted: { fontSize: 11, color: colors.muted, lineHeight: 17 },
  button: {
    backgroundColor: colors.green,
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  label: { fontSize: 11, color: colors.ink, marginBottom: 7, marginTop: 12 },
  input: {
    backgroundColor: colors.pale,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    color: colors.ink,
    fontSize: 14,
    marginBottom: 8,
  },
  error: {
    color: '#ab2924',
    backgroundColor: '#fff0ed',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  link: { color: colors.blue, textAlign: 'center', fontSize: 13, marginVertical: 12 },
  badge: {
    color: '#008a64',
    fontSize: 10,
    backgroundColor: '#e1f8ee',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: colors.line,
    padding: 12,
    backgroundColor: 'white',
  },
  navItem: { alignItems: 'center', gap: 4 },
  navText: { fontSize: 9, color: colors.muted },
  hero: { color: colors.green, fontSize: 60, textAlign: 'center', marginVertical: 35 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 24 },
  dot: { height: 5, width: 10, borderRadius: 3, backgroundColor: colors.line },
  trust: { fontSize: 9, color: colors.muted, textAlign: 'center', marginTop: 20, marginBottom: 10 },
  map: {
    height: 190,
    backgroundColor: '#edf3ff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  section: {
    fontSize: 17,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: colors.ink,
    marginVertical: 14,
  },
});
export function Page({
  title,
  tag,
  meta,
  subtitle,
  children,
  nav,
  navigation,
}: {
  title: string;
  tag?: string;
  meta?: string;
  subtitle?: string;
  children: React.ReactNode;
  nav?: boolean;
  navigation?: any;
}) {
  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {navigation?.canGoBack() && (
          <Pressable onPress={() => navigation.goBack()} accessibilityLabel={t('Go back')}>
            <Text style={[s.link, { textAlign: 'left' }]}>{t('\u2039 Back')}</Text>
          </Pressable>
        )}
        {(tag || meta) && (
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
            {tag ? <Text style={s.tag}>{tag}</Text> : <View />}
            {meta ? (
              <Text style={[s.muted, { textTransform: 'uppercase', letterSpacing: 0.6 }]}>
                {meta}
              </Text>
            ) : null}
          </View>
        )}
        <Text accessibilityRole="header" style={s.title}>
          {title}
        </Text>
        {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        {children}
      </ScrollView>
      {nav && <BottomNav navigation={navigation} />}
    </SafeAreaView>
  );
}
export function BottomNav({ navigation }: { navigation: any }) {
  return (
    <View style={[s.nav, { alignItems: 'flex-end', paddingBottom: 8 }]}>
      {[
        ['⌂', 'Home', 'M12'],
        ['♧', 'Knowledge', 'M28'],
        ['!', 'SOS', 'M13'],
        ['▢', 'Vault', 'M18'],
        ['♙', 'Profile', 'M11'],
      ].map(([icon, label, screen]) =>
        label === 'SOS' ? (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => navigation.navigate(screen)}
            style={[s.navItem, { marginTop: -18 }]}
          >
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: colors.red,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: colors.red,
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>{icon}</Text>
            </View>
            <Text style={[s.navText, { color: colors.red }]}>{label}</Text>
          </Pressable>
        ) : (
          <Pressable
            key={label}
            style={s.navItem}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => navigation.navigate(screen)}
          >
            <Text style={{ fontSize: 22, color: colors.green }}>{icon}</Text>
            <Text style={s.navText}>{label}</Text>
          </Pressable>
        ),
      )}
    </View>
  );
}
export function ShieldMark({ size = 72 }: { size?: number }) {
  const box = size;
  return (
    <View
      accessibilityLabel={t('Suraksha shield')}
      style={{
        width: box,
        height: box * 1.15,
        alignSelf: 'center',
        marginVertical: 18,
        borderWidth: 3,
        borderColor: colors.green,
        borderTopLeftRadius: box / 2.2,
        borderTopRightRadius: box / 2.2,
        borderBottomLeftRadius: box / 1.4,
        borderBottomRightRadius: box / 1.4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e8faf2',
      }}
    >
      <Text style={{ color: colors.green, fontSize: box * 0.45, fontWeight: '700' }}>✓</Text>
    </View>
  );
}
export function Stepper({
  step = 1,
  total = 5,
  label,
}: {
  step?: number;
  total?: number;
  label?: string;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      {label && (
        <Text style={[s.muted, { textAlign: 'center', marginBottom: 8 }]}>
          {t('Step')} {step} {t('of')} {total} · {label}
        </Text>
      )}
      <View style={[s.row, { justifyContent: 'center', gap: 0 }]}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[s.row, { gap: 0 }]}>
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                borderWidth: 2,
                borderColor: i < step ? colors.green : colors.line,
                backgroundColor: i + 1 === step ? colors.green : i < step ? colors.blue : 'white',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i + 1 === step && <Text style={{ color: 'white', fontSize: 10 }}>✓</Text>}
            </View>
            {i < total - 1 && (
              <View
                style={{
                  width: 28,
                  height: 2,
                  backgroundColor: i + 1 < step ? colors.green : colors.line,
                  alignSelf: 'center',
                }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View
      style={[
        s.row,
        {
          backgroundColor: colors.pale,
          borderRadius: 14,
          padding: 4,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.line,
        },
      ]}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={{
              flex: 1,
              backgroundColor: selected ? colors.green : 'transparent',
              borderRadius: 11,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: selected ? 'white' : colors.muted, fontWeight: '600' }}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
export function TrustBadges({
  items = ['SOS', 'ENCRYPTED', 'VERIFIED'],
}: {
  items?: string[];
}) {
  return (
    <View style={[s.row, { justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }]}>
      {items.map((item, i) => (
        <View key={item} style={[s.row, { gap: 6 }]}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: i === 0 ? colors.blue : colors.green,
            }}
          />
          <Text style={s.trust}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
export function IconCard({
  title,
  detail,
  icon,
  onPress,
  tone = 'default',
}: {
  title: string;
  detail: string;
  icon: string;
  onPress: () => void;
  tone?: 'default' | 'sos';
}) {
  const sos = tone === 'sos';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={[
        s.card,
        s.row,
        sos
          ? { backgroundColor: colors.red, borderColor: colors.red }
          : { backgroundColor: '#f7fbfe' },
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sos ? 'white' : colors.navy,
        }}
      >
        <Text style={{ fontSize: 20, color: sos ? colors.red : 'white' }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.text, sos && { color: 'white', fontWeight: '700' }]}>{title}</Text>
        <Text style={[s.muted, sos && { color: '#ffe4e1' }]}>{detail}</Text>
      </View>
      <Text style={{ color: sos ? 'white' : colors.muted, fontSize: 22 }}>›</Text>
    </Pressable>
  );
}
export function Button({
  title,
  onPress,
  tone = 'green',
  disabled = false,
}: {
  title: string;
  onPress: () => void | Promise<unknown>;
  tone?: 'green' | 'blue' | 'red' | 'outline';
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        disabled={disabled || busy}
        style={[
          s.button,
          {
            backgroundColor: tone === 'outline' ? 'white' : colors[tone],
            borderWidth: tone === 'outline' ? 1 : 0,
            borderColor: colors.ink,
            opacity: disabled || busy ? 0.5 : 1,
          },
        ]}
        onPress={async () => {
          setBusy(true);
          setError('');
          try {
            await onPress();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Unable to complete action');
          } finally {
            setBusy(false);
          }
        }}
      >
        <Text style={[s.buttonText, tone === 'outline' && { color: colors.ink }]}>
          {busy ? 'Please wait…' : title}
        </Text>
      </Pressable>
      {error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
    </>
  );
}
export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={[s.card, style]}>
      {children}
    </Pressable>
  ) : (
    <View style={[s.card, style]}>{children}</View>
  );
}
export function Input({
  label,
  value,
  onChange,
  secure = false,
  multiline = false,
  keyboardType = 'default',
  icon,
  revealable = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  secure?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  icon?: string;
  revealable?: boolean;
}) {
  const [hidden, setHidden] = useState(secure);
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <View style={{ position: 'relative' }}>
        {icon ? (
          <Text
            style={{
              position: 'absolute',
              left: 12,
              top: multiline ? 14 : 13,
              zIndex: 1,
              color: colors.navy,
              fontSize: 16,
            }}
          >
            {icon}
          </Text>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure ? hidden : false}
          multiline={multiline}
          keyboardType={keyboardType}
          style={[
            s.input,
            icon ? { paddingLeft: 36 } : null,
            revealable ? { paddingRight: 44 } : null,
            multiline && { minHeight: 90, textAlignVertical: 'top' },
          ]}
        />
        {revealable && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? t('Show password') : t('Hide password')}
            onPress={() => setHidden((v) => !v)}
            style={{ position: 'absolute', right: 12, top: 12 }}
          >
            <Text style={{ color: colors.muted }}>{hidden ? '◯' : '◉'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
export function PasswordStrength({ value }: { value: string }) {
  const score =
    (value.length >= 8 ? 1 : 0) +
    (/[0-9]/.test(value) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(value) ? 1 : 0) +
    (/[A-Z]/.test(value) && /[a-z]/.test(value) ? 1 : 0);
  return (
    <View style={[s.row, { gap: 6, marginBottom: 8 }]}>
      {Array.from({ length: 4 }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 5,
            borderRadius: 3,
            backgroundColor: i < score ? colors.green : colors.line,
          }}
        />
      ))}
    </View>
  );
}
export function relativeTime(iso: string) {
  const delta = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(delta) || delta < 0) return new Date(iso).toLocaleString();
  const hours = Math.floor(delta / 3_600_000);
  if (hours < 24) return hours < 1 ? t('Added today') : t('Added today');
  const days = Math.floor(hours / 24);
  if (days === 1) return t('1 day ago');
  if (days < 14) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}
export function Choice({
  label,
  selected,
  onPress,
  detail,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  detail?: string;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[s.card, s.row, selected && { backgroundColor: '#e8faf2', borderColor: colors.green }]}
    >
      <Text style={{ color: selected ? colors.green : colors.muted, fontSize: 20 }}>
        {selected ? '◉' : '○'}
      </Text>
      <View style={{ flex: 1 }}>
        <Text style={s.text}>{label}</Text>
        {detail && <Text style={s.muted}>{detail}</Text>}
      </View>
    </Pressable>
  );
}
export function State({
  query,
}: {
  query: {
    isLoading: boolean;
    error: Error | null;
  };
}) {
  if (query.isLoading)
    return <ActivityIndicator accessibilityLabel={t('Loading')} color={colors.green} />;
  if (query.error)
    return (
      <Text accessibilityRole="alert" style={s.error}>
        {query.error.message}
      </Text>
    );
  return null;
}
export function Trust({ text = 'PRIVATE ACCESS   ■   SURAKSHA PROTOTYPE' }: { text?: string }) {
  return (
    <Text style={s.trust}>
      {t('\u25A0')}
      {text}
    </Text>
  );
}
export function Dots({ step = 1, total = 3 }: { step?: number; total?: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[s.dot, i === step - 1 && { width: 28, backgroundColor: colors.green }]}
        />
      ))}
    </View>
  );
}
export function MapCard({ latitude, longitude }: { latitude?: number; longitude?: number }) {
  return (
    <View style={s.map}>
      <Text style={{ color: colors.blue, fontSize: 32 }}>{t('\u25CF')}</Text>
      <Text style={s.text}>
        {latitude !== undefined
          ? `${latitude.toFixed(5)}, ${longitude?.toFixed(5)}`
          : 'Location unavailable'}
      </Text>
      <Text style={s.muted}>{t('Development coordinate map')}</Text>
    </View>
  );
}

export function PinPad({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View accessibilityLabel={label}>
      <Text style={s.label}>{t(label)}</Text>
      <View style={[s.row, { justifyContent: 'center', marginVertical: 15 }]}>
        {Array.from({ length: 6 }, (_, i) => (
          <View
            key={i}
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: i < value.length ? colors.green : 'white',
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((digit, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={digit === '⌫' ? 'Delete PIN digit' : digit || 'Empty keypad cell'}
            disabled={!digit}
            onPress={() =>
              onChange(digit === '⌫' ? value.slice(0, -1) : (value + digit).slice(0, 6))
            }
            style={[
              s.card,
              {
                width: '30%',
                alignItems: 'center',
                padding: 12,
                marginBottom: 0,
                opacity: digit ? 1 : 0,
              },
            ]}
          >
            <Text style={s.text}>{digit}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
