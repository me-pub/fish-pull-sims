import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { getAllSpecies } from '@/lib/fishData';
import type { Species } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const data = useMemo(() => getAllSpecies(), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.scientific_name.toLowerCase().includes(q) ||
        s.habitat.toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Fish Select</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search species or habitat"
        placeholderTextColor="#888"
        style={styles.search}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <FishCard item={item} />}
      />
    </View>
  );
}

function FishCard({ item }: { item: Species }) {
  return (
    <Link href={`/fish/${item.id}`} asChild>
      <Pressable style={{ flex: 1 }}>
        <Card style={{ gap: 8 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.scientific_name}</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Tag label={item.tackle_class} variant="blue" />
            <Tag label={item.habitat.split(',')[0]} variant="cyan" />
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212', padding: 16 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  search: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cardSubtitle: { color: '#AAAAAA', fontSize: 12 },
});
