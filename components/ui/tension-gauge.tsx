// Import compiled module path to avoid Metro resolving TS sources on some setups
import Svg, { Circle, Path } from 'react-native-svg';
import { View, Text, StyleSheet } from 'react-native';

export function TensionGauge({ value }: { value: number }) {
  const size = 200;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = Math.PI * 0.75; // 135°
  const endAngle = Math.PI * 2.25; // 405° (wraps past 360 for big arc)
  const angle = startAngle + (endAngle - startAngle) * Math.max(0, Math.min(1, value));

  const arc = (a: number) => {
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    return { x, y };
  };

  const start = arc(startAngle);
  const cur = arc(angle);
  const large = angle - startAngle > Math.PI ? 1 : 0;

  const path = `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${cur.x} ${cur.y}`;

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke="#2A2A2A" strokeWidth={stroke} fill="none" />
        <Path d={path} stroke="#00BFA6" strokeWidth={stroke} strokeLinecap="round" fill="none" />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.value}>{Math.round(value * 100)}%</Text>
        <Text style={styles.label}>Tension</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  value: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  label: { color: '#AAAAAA', fontSize: 12, marginTop: 4 },
});

