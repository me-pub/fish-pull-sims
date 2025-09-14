import { useEffect, useMemo } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { getSpeciesById } from '@/lib/fishData';
import { Tag } from '@/components/ui/tag';
import { Card } from '@/components/ui/card';
import { useSettings } from '@/lib/store';

export default function FishDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const species = useMemo(() => (id ? getSpeciesById(id) : undefined), [id]);
  const { hapticsEnabled, setHaptics, difficulty, setDifficulty, setLastFishId } = useSettings();

  if (!species) {
    return (
      <View style={styles.screen}> 
        <Text style={styles.title}>Fish not found</Text>
      </View>
    );
  }

  useEffect(() => {
    setLastFishId(species.id);
  }, [setLastFishId, species.id]);

  const fp = species.fight_profile;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 28 }}>
      <Text style={styles.title}>{species.name}</Text>
      <Text style={styles.subtitle}>{species.scientific_name}</Text>

      <View style={{ height: 12 }} />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Tag label={species.tackle_class} variant="blue" />
        <Tag label={species.habitat.split(',')[0]} variant="cyan" />
      </View>

      <View style={{ height: 16 }} />
      <Card style={{ gap: 8 }}>
        <Text style={styles.section}>Fight Profile</Text>
        <Stat label="Burst speed" value={fp.burst_speed} />
        <Stat label="Initial run distance" value={fp.initial_run_distance} />
        {fp.jump_probability != null && <Stat label="Jump probability" value={fp.jump_probability} />}
        {fp.jump_frequency_per_min != null && (
          <Stat label="Jump frequency/min" value={fp.jump_frequency_per_min} />
        )}
        {fp.dive_probability != null && <Stat label="Dive probability" value={fp.dive_probability} />}
        {fp.circle_under_boat_probability != null && (
          <Stat label="Circle under boat" value={fp.circle_under_boat_probability} />
        )}
        {fp.headshake_intensity != null && <Stat label="Headshake intensity" value={fp.headshake_intensity} />}
        <Stat label="Stamina index" value={fp.stamina_index} />
        <Text style={styles.fieldLabel}>Pattern</Text>
        <Text style={styles.body}>{fp.cover_or_depth_escape_tendency.replaceAll('_', ' ')}</Text>
        <Text style={styles.fieldLabel}>Typical phases</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {fp.typical_phases.map((p) => (
            <Tag key={p} label={p.replaceAll('_', ' ')} variant="neutral" />
          ))}
        </View>
      </Card>

      {species.angler_tips_to_simulate && (
        <>
          <View style={{ height: 12 }} />
          <Card style={{ gap: 8 }}>
            <Text style={styles.section}>Tips</Text>
            {species.angler_tips_to_simulate.map((t, i) => (
              <Text key={i} style={styles.body}>• {t}</Text>
            ))}
          </Card>
        </>
      )}

      <View style={{ height: 12 }} />
      <Card style={{ gap: 12 }}>
        <Text style={styles.section}>Settings</Text>
        <Row>
          <Text style={styles.body}>Haptics</Text>
          <Pressable onPress={() => setHaptics(!hapticsEnabled)}>
            <Tag label={hapticsEnabled ? 'On' : 'Off'} variant={hapticsEnabled ? 'teal' : 'red'} />
          </Pressable>
        </Row>
        <Row>
          <Text style={styles.body}>Difficulty</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <Pressable key={d} onPress={() => setDifficulty(d)}>
                <Tag label={d} variant={difficulty === d ? 'teal' : 'neutral'} />
              </Pressable>
            ))}
          </View>
        </Row>
      </Card>

      <View style={{ height: 16 }} />
      <Pressable style={styles.playBtn} onPress={() => router.push(`/simulate/${species.id}`)}>
        <Text style={styles.playText}>Play</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>{children}</View>;
}

function Stat({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(1, value / 10));
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.body}>{label}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212', padding: 16 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#AAAAAA', fontSize: 14, marginBottom: 10 },
  section: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  fieldLabel: { color: '#AAAAAA', fontSize: 12, marginTop: 8 },
  body: { color: '#FFFFFF', fontSize: 14 },
  barBg: { height: 10, backgroundColor: '#2A2A2A', borderRadius: 999, overflow: 'hidden' },
  barFill: { height: 10, backgroundColor: '#00BFA6' },
  playBtn: { backgroundColor: '#00BFA6', paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
  playText: { color: '#000000', fontWeight: '800', fontSize: 16 },
});
