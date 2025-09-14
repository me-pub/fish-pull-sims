import dataset from '@/assets/fish_data.json';
import type { FishDataset, Species } from '@/lib/types';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

let cached: Species[] | null = null;

export function getAllSpecies(): Species[] {
  if (cached) return cached;
  const data = dataset as unknown as FishDataset;
  cached = data.species.map((sp) => ({ id: slug(sp.name), ...sp }));
  return cached;
}

export function getSpeciesById(id: string): Species | undefined {
  return getAllSpecies().find((s) => s.id === id);
}

export function searchSpecies(query: string): Species[] {
  const q = query.trim().toLowerCase();
  if (!q) return getAllSpecies();
  return getAllSpecies().filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.scientific_name.toLowerCase().includes(q) ||
      s.habitat.toLowerCase().includes(q)
  );
}

