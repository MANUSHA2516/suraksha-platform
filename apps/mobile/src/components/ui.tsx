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
  subtitle,
  children,
  nav,
  navigation,
}: {
  title: string;
  tag?: string;
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
        {tag && <Text style={s.tag}>{tag}</Text>}
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
    <View style={s.nav}>
      {[
        ['⌂', 'Home', 'M12'],
        ['♧', 'Knowledge', 'M28'],
        ['△', 'SOS', 'M13'],
        ['▢', 'Vault', 'M18'],
        ['♙', 'Profile', 'M11'],
      ].map(([icon, label, screen]) => (
        <Pressable
          key={label}
          style={s.navItem}
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={() => navigation.navigate(screen)}
        >
          <Text style={{ fontSize: 22, color: label === 'SOS' ? colors.red : colors.green }}>
            {icon}
          </Text>
          <Text style={s.navText}>{label}</Text>
        </Pressable>
      ))}
    </View>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  secure?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
}) {
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[s.input, multiline && { minHeight: 90, textAlignVertical: 'top' }]}
      />
    </View>
  );
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
