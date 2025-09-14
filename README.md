# Fish Fight Simulator (Expo + React Native)

Simulate shoreline fish fights using curated species profiles from Indonesia’s coast. Built with Expo, runs fully offline, and follows our dark, card‑based UI.

Status (2025-09-14)
- Phase 1 (Data + Navigation) ✅
- Phase 2 (Simulation + Haptics) ✅
- Phase 3 (History) ⏳

## Features

- Offline dataset: `assets/fish_data.json` with species fight profiles (0–10 indexes)
- Fish Select grid with search; Fish Detail with stats and tips
- Simulation screen with tension gauge, line‑out and stamina bars
- Event feedback via haptics (jump, dive, headshake, landed/breakoff)
- Subtle “pull buzz” while the fish is running; cadence follows tension
- Settings: difficulty, haptics on/off, and haptics mode (Subtle • Detailed • Android Continuous)

## Screens (WIP)

- Home: fish grid, search
- Detail: stats as bars, tags, Play button
- Simulation: circular tension gauge, bars, event toasts

## Quick start

```bash
npm install
npx expo start
```

Tips
- Use `npx expo start -c` to clear cache after dependency changes.
- We include `metro.config.js` to prefer compiled entries (helps react-native-svg resolution).

## Tech stack

- Expo SDK 54, React Native 0.81, TypeScript
- Router: expo-router
- State/persistence: zustand + MMKV (fallback to memory in Expo Go)
- Haptics: expo-haptics; optional Android continuous via Vibration API
- UI: custom components (Card, Tag, TensionGauge), react-native-svg

## Project structure

```
app/
  (tabs)/index.tsx        // Fish Select (grid + search)
  fish/[id].tsx           // Fish Detail + Settings + Play
  simulate/[id].tsx       // Simulation (tension gauge, bars, toasts)
assets/
  fish_data.json          // Species dataset (relative 0–10 scales)
components/ui/
  card.tsx, tag.tsx, tension-gauge.tsx
lib/
  types.ts                // TS models
  fishData.ts             // Load/slug/search species
  store.ts                // Settings (haptics, difficulty, mode)
  sim/
    engine.ts             // 20 Hz loop, FSM, model
    feedback.ts           // Haptics mapping + background pulses
docs/
  FishFightSimulator.md   // Full spec
  ui_guide.md             // Design guide
```

## Simulation model (summary)

- 20 Hz tick; phases: running | headshake | jumping | diving | circling → landed | breakoff
- Tension ~ burst × stamina with per‑event modifiers; line‑out increases on runs, decreases with tension
- Difficulty changes stamina decay, breakoff window, and jump loss
- Haptics: distinct event cues; background micro‑pulses mapped to tension

## Contributing

- Follow the palette and component rules in `docs/ui_guide.md`.
- Keep all numeric inputs normalized (0–10 as in dataset).
- File‑based routes only under `app/`.

## License

Proprietary / research use. Ask before redistributing.

