# Fish Fight Simulator (Expo)

A mobile app to simulate fish fights for common Indonesian shoreline species. Runs fully offline with local-only data and state.

Status on 2025-09-14: Phase 0 (Create Expo app with TypeScript) is complete. Next is Phase 1 (data + navigation).

---

## Overview

- No login, no backend — everything works offline.
- Fast flow: open app → pick fish → view details → Play → simulation.
- UI must follow docs/ui_guide.md (dark theme, rounded cards, colorful stat chips, big gauges).
- Local persistence for fish dataset, last selection, settings, and session history.

---

## Tech Stack

- Runtime: Expo SDK 51+, React Native, TypeScript
- Navigation: expo-router
- State: Zustand + Immer
- Storage: react-native-mmkv-expo (MMKV)
- Haptics: expo-haptics
- Audio: expo-av (prepared but not used yet)
- Animations/Gestures: react-native-reanimated, react-native-gesture-handler
- UI: nativewind (Tailwind for RN), react-native-svg for gauges, @expo/vector-icons
- Testing: Jest, React Native Testing Library

---

## Data Source and Schema

- Source file: `assets/fish_data.json`
- Top-level fields: `version`, `generated_at`, `units`, `species` (array)
- Units: all numeric attributes are relative indexes 0–10 (see `units` in JSON)

TypeScript types used in the app:

```ts
export type FightProfile = {
  burst_speed: number; // 0–10
  initial_run_distance: number; // 0–10
  jump_probability?: number; // 0–10
  jump_frequency_per_min?: number; // optional, 0–10
  dive_probability?: number; // 0–10
  circle_under_boat_probability?: number; // 0–10
  headshake_intensity?: number; // 0–10
  stamina_index: number; // 0–10
  cover_or_depth_escape_tendency: string; // enum-like string
  typical_phases: string[];
};

export type Species = {
  id: string; // slug generated from name
  name: string;
  scientific_name: string;
  habitat: string;
  tackle_class: string;
  fight_profile: FightProfile;
  angler_tips_to_simulate?: string[];
  image_url?: string;
};

export type FishDataset = {
  version: string;
  generated_at: string; // ISO date
  units: 'relative-index-0to10';
  species: Omit<Species, 'id'>[]; // id added at load time
};

export type Session = {
  id: string;
  fishId: string;
  startedAt: number; // epoch ms
  durationMs: number;
  landed: boolean;
  breakoffs: number;
  difficulty: 'easy' | 'medium' | 'hard';
};
```

ID strategy: create a stable slug from `name` (e.g., "Bandeng (Milkfish)" → `bandeng-milkfish`).

MMKV keys:
- `fish.dataset.v1` — cached dataset from `assets/fish_data.json`
- `settings.v1` — haptics on/off, difficulty, theme
- `history.v1` — array of `Session`
- `lastFishId` — last opened species id

---

## Planned Routes (expo-router)

- `app/(tabs)/index.tsx` — Fish Select (grid/list + search)
- `app/fish/[id].tsx` — Details + Play
- `app/simulate/[id].tsx` — Simulation (gauges, event toasts, controls)
- `app/modal.tsx` — Reusable modal (e.g., session summary)

The repo currently contains the Expo tabs template; these routes will replace/extend it during Phase 1–2.

---

## Simulation Design

Core idea: drive events from each species' `fight_profile`, then map events to UI gauges and haptic feedback.

- Tick rate: 20 Hz (50 ms per tick), seeded RNG for reproducibility.
- Finite states: `idle → hit → running | headshake | jumping | diving | circling → landed | breakoff`.
- Difficulty affects stamina decay, event probability multipliers, and breakoff tolerance windows.

Model (normalized 0–1, derived from 0–10 inputs):
- Force output F(t) ~ burst_speed and current stamina S(t).
- Line tension T(t) = clamp(F(t) − give + user_drag, 0..1).
- Stamina S(t+Δ) = S(t) − base_decay × difficulty_factor × event_load.
- Line out L(t) increases with `initial_run_distance` and decreases when user "reels" (later IoT/controls).
- Breakoff occurs if T(t) > threshold for N ms (shorter N on hard) or on jump slack failure probability.
- Landed when S(t) < epsilon and L(t) < low threshold for M ms.

Difficulty presets:
- easy: decay 0.7×, breakoff window 350 ms, jump-loss −40%
- medium: decay 1.0×, breakoff window 250 ms, jump-loss baseline
- hard: decay 1.3×, breakoff window 150 ms, jump-loss +40%

Event probabilities per tick are scaled from fight_profile fields (e.g., `jump_probability/10`). Some species omit fields; missing = 0.

---

## Feedback Mapping

- running: medium haptic pulses at ~3 Hz
- headshake: short warning haptic bursts
- jumping: light impact haptic and brief tension drop
- diving: medium impact haptic
- circling: soft periodic haptic at 2–3 Hz
- landed: success haptic
- breakoff: error haptic

Audio is intentionally stubbed for Phase 1–2.

---

## UI Contract (must follow docs/ui_guide.md)

- Dark-first palette; cards `rounded-2xl`; 16 px screen padding; 12–16 px card spacing.
- Components: Card, Tag, Gauge (SVG arc), StatTile, Toolbar, Primary/Secondary Button.
- Layouts: two-column stat grid; large circular tension gauge + horizontal line-out bar in Simulation.
- Animations: fade/slide transitions; spring on gauge updates; event toasts slide from top.

---

## Minimal Data Loader (example)

```ts
// lib/fishData.ts
import { MMKV } from 'react-native-mmkv-expo';
import raw from '@/assets/fish_data.json';

const storage = new MMKV();

export type { FishDataset, Species } from '@/types';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function getSpecies(): Species[] {
  const cached = storage.getString('fish.dataset.v1');
  if (cached) return JSON.parse(cached);
  const dataset = raw as any; // FishDataset
  const species = dataset.species.map((sp: any) => ({ id: slug(sp.name), ...sp }));
  storage.set('fish.dataset.v1', JSON.stringify(species));
  return species;
}
```

---

## Development Phases and Acceptance

Phase 0 — Project setup (done)
- Expo app with TypeScript builds and runs on Android/iOS.

Phase 1 — Core data & navigation
- Load `assets/fish_data.json`, seed MMKV, implement Fish Select and Details.
- Acceptance: choose a fish and reach Details; settings toggle persists.

Phase 2 — Simulation engine
- FSM + RNG loop, gauges, haptics mapping, Pause/End controls.
- Acceptance: simulation ticks at 20 Hz; visible events; no crashes.

Phase 3 — History
- Persist sessions; show recent on home; session detail modal.
- Acceptance: sessions survive app restart.

Phase 4 — Polish & accessibility
- Animations, skeletons, reduced haptics, larger text mode, contrast checks.

Phase 5 — QA & release
- Unit tests for engine; RNTL tests for key screens; manual device matrix.

---

## Quick Start (for new contributors)

```bash
npm i
npx expo install react-native-mmkv-expo expo-haptics expo-av react-native-svg
npx expo install react-native-gesture-handler react-native-reanimated
npm i zustand immer nativewind tailwindcss expo-router @expo/vector-icons
npm run start
```

---

## Future Work

- Audio cues once assets are ready.
- Optional BLE reel sensor integration (ESP32) for real-time tension input.
- Extend dataset with freshwater species and per-location variants.
- Export/share session history.

