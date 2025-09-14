import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { getSpeciesById } from '@/lib/fishData';
import { useSettings } from '@/lib/store';
import { useMemo, useRef } from 'react';
import { useSimulation } from '@/lib/sim/engine';
import { TensionGauge } from '@/components/ui/tension-gauge';

export default function SimulationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sp = useMemo(() => (id ? getSpeciesById(id) : undefined), [id]);
  const { hapticsEnabled, hapticsMode, difficulty } = useSettings();
  const toastY = useRef(new Animated.Value(-40)).current;

  if (!sp) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}> 
        <Text style={styles.title}>Not found</Text>
      </View>
    );
  }

  const sim = useSimulation(sp, difficulty, hapticsEnabled, hapticsMode);

  // Simple toast animation when lastEvent exists
  if (sim.snapshot.lastEvent) {
    Animated.sequence([
      Animated.timing(toastY, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.delay(600),
      Animated.timing(toastY, { toValue: -40, duration: 150, useNativeDriver: true }),
    ]).start();
  }

  const status = sim.done ?? sim.snapshot.phase;

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.toast, { transform: [{ translateY: toastY }] }]}> 
        <Text style={styles.toastText}>{labelForEvent(sim.snapshot.lastEvent ?? sim.snapshot.phase)}</Text>
      </Animated.View>

      <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
        <TensionGauge value={sim.snapshot.tension} />
      </View>

      <View style={styles.row}> 
        <Bar label="Line Out" value={sim.snapshot.lineOut} color="#40C4FF" />
        <Bar label="Stamina" value={sim.snapshot.stamina} color="#FFD54F" />
      </View>

      <View style={{ height: 20 }} />
      <View style={styles.controls}>
        {!sim.paused ? (
          <SmallBtn label="Pause" onPress={sim.pause} />
        ) : (
          <SmallBtn label="Resume" onPress={sim.resume} />
        )}
        <SmallBtn label="End" onPress={() => router.back()} variant="red" />
      </View>

      {sim.done && (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>{status === 'landed' ? 'Landed!' : 'Breakoff!'}</Text>
          <SmallBtn label="Back" onPress={() => router.back()} />
        </View>
      )}
    </View>
  );
}

function labelForEvent(e: string) {
  switch (e) {
    case 'headshake': return 'Headshake';
    case 'jump': return 'Jump';
    case 'dive': return 'Dive';
    case 'circling':
    case 'circle_tick': return 'Circling';
    case 'run_start':
    case 'run_tick':
    case 'running': return 'Running';
    case 'landed': return 'Landed';
    case 'breakoff': return 'Breakoff';
    default: return '';
  }
}

function SmallBtn({ label, onPress, variant = 'teal' }: { label: string; onPress: () => void; variant?: 'teal' | 'red' }) {
  return (
    <Pressable onPress={onPress} style={[styles.btn, { backgroundColor: variant === 'teal' ? '#00BFA6' : '#FF5252' }]}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={styles.body}>{label}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212', padding: 16 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  body: { color: '#FFFFFF', fontSize: 14 },
  row: { flexDirection: 'row', gap: 12 },
  barBg: { height: 12, backgroundColor: '#2A2A2A', borderRadius: 999, overflow: 'hidden' },
  barFill: { height: 12 },
  controls: { flexDirection: 'row', gap: 12 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999 },
  btnText: { color: '#000', fontWeight: '800' },
  toast: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', paddingTop: 8 },
  toastText: { backgroundColor: '#1E1E1E', color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' },
  doneBox: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, alignItems: 'center', gap: 12 },
  doneText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
