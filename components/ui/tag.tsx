import { Text, View, StyleSheet } from 'react-native';

type Variant = 'teal' | 'red' | 'yellow' | 'cyan' | 'blue' | 'neutral';

const colors: Record<Variant, { bg: string; fg: string }> = {
  teal: { bg: '#00BFA6', fg: '#000000' },
  red: { bg: '#FF5252', fg: '#000000' },
  yellow: { bg: '#FFD54F', fg: '#000000' },
  cyan: { bg: '#29B6F6', fg: '#000000' },
  blue: { bg: '#40C4FF', fg: '#000000' },
  neutral: { bg: '#2A2A2A', fg: '#FFFFFF' },
};

export function Tag({ label, variant = 'neutral' }: { label: string; variant?: Variant }) {
  const c = colors[variant];
  return (
    <View style={[styles.tag, { backgroundColor: c.bg }]}> 
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: { fontWeight: '600', fontSize: 12 },
});

