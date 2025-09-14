# 🎣 Fish Fight Simulator (Expo)

A mobile app for simulating fish fights in Indonesian shoreline fishing.  
Built with **Expo + React Native + TypeScript**, designed for offline, local-only use.

---

## 📱 Overview

- **No login, no backend** → everything works offline.  
- **Immediate flow**: User opens app → selects fish → sees details → hits **Play** → enters fight simulation.  
- **Design language**: Dark theme, colorful stat cards, rounded UI components (like reference screenshot).  
- **Local storage**: Stores fish data JSON, last selected fish, user settings (sound/haptics), and session history.  

---

## 🛠 Tech Stack

- **Runtime**: Expo (SDK 51+) · React Native · TypeScript
- **Navigation**: [expo-router](https://expo.github.io/router/)
- **State management**: Zustand + Immer
- **Local storage**: [react-native-mmkv-expo](https://docs.expo.dev/versions/latest/sdk/mmkv/)  
- **Haptics**: [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- **Audio**: [expo-av](https://docs.expo.dev/versions/latest/sdk/av/) (**ignored for now**, placeholders only)
- **Animations & gestures**: react-native-reanimated, react-native-gesture-handler
- **UI**: nativewind (Tailwind for RN), react-native-svg (for gauges/charts)
- **Icons**: @expo/vector-icons
- **Testing**: Jest, React Native Testing Library
- **Dev**: Expo Dev Client, ESLint, Prettier, TypeScript strict

---

## 📂 Directory Layout

```
app/
 ├─ _layout.tsx          # Root navigation (expo-router)
 ├─ index.tsx            # Fish select grid/list
 ├─ fish/[id].tsx        # Fish details + Play button
 ├─ simulate/[id].tsx    # Simulation screen (gauges, feedback)
assets/
 ├─ images/              # Fish icons/images
 ├─ sounds/              # mp3 placeholders (ignored for now)
lib/
 ├─ fishData.ts          # Shoreline fish JSON dataset
 ├─ store.ts             # Zustand store
 ├─ sim/
 │   ├─ engine.ts        # Finite-state machine + RNG loop
 │   └─ feedback.ts      # Haptics + (future audio) mapping
 └─ ui/                  # Reusable UI components (Card, Gauge, Tag, Button)
```

---

## 🧩 Data Model

```ts
type FightProfile = {
  burst_speed: number;
  initial_run_distance: number;
  jump_probability: number;
  jump_frequency_per_min?: number;
  dive_probability: number;
  circle_under_boat_probability: number;
  headshake_intensity: number;
  stamina_index: number;
  cover_or_depth_escape_tendency: string;
  typical_phases: string[];
};

type Fish = {
  id: string;
  name: string;
  scientific_name: string;
  habitat: string;
  tackle_class: string;
  fight_profile: FightProfile;
  image_url?: string;
};

type Session = {
  id: string;
  fishId: string;
  startedAt: number;
  durationMs: number;
  landed: boolean;
  breakoffs: number;
  difficulty: 'easy' | 'med' | 'hard';
};
```

**Storage keys (MMKV):**
- `fish.dataset.v1`
- `settings.v1`
- `history.v1`
- `lastFishId`

---

## 🎨 Design Language

- **Dark-first UI**, cards with `rounded-2xl`, soft shadows.
- **Color tags**:  
  - teal → available / good  
  - red → danger / breakoff  
  - yellow → warning  
  - cyan → info  
- **Components**: `Card`, `Tag`, `Gauge`, `StatTile`, `Toolbar`.
- **Animations**: fade/slide on navigation, spring transitions for gauges.

---

## 🎮 Simulation Engine

- **State machine**:
  - `idle → hit → running | headshake | jumping | diving | circling ↔ running → landed | breakoff`
- **Tick rate**: 10–20 Hz, seeded RNG for reproducibility.
- **Force model**: line tension = fish force − drag.  
  - Difficulty modifies stamina decay & event probability.

**Event mapping → feedback:**
- `run_start/run_tick`: haptic medium pulses (≤8Hz) + drag sound (future)
- `headshake`: warning haptic + “ping” sound (future)
- `jump`: light impact haptic + “splash” sound (future); adds slack
- `dive`: medium impact haptic + low-pitch drag sound (future)
- `circle_tick`: soft haptics at 2–3Hz
- `landed`: success haptic
- `breakoff`: error haptic

⚠️ **Note:** Audio cues (`.mp3` in `assets/sounds/`) are **ignored for now** but placeholders are created.

---

## 📅 Development Plan

### Phase 0 — Project setup
**Epic: Tooling & Skeleton**
- Create Expo app with TypeScript
- Add libraries: router, zustand, mmkv, nativewind, reanimated, haptics, av (prep only)
- Configure ESLint/Prettier
- **Acceptance:** app builds & runs on Android/iOS

---

### Phase 1 — Core data & navigation
**Epic: Fish Data**
- Import JSON dataset  
- Seed into MMKV if empty  

**Epic: Navigation**
- Fish selector grid  
- `/fish/[id]` → details  

**Epic: Detail screen**
- Show stats in cards  
- Play button  
- Settings toggles (sound/haptics, difficulty)

---

### Phase 2 — Simulation Engine
**Epic: State machine**
- Implement FSM + RNG loop  
- Force/stamina model  

**Epic: Feedback**
- Map haptic patterns to events  
- Stub audio methods (future)

**Epic: Simulation UI**
- Gauges: line tension (arc), line out (progress)  
- Event toasts: “Jump!”, “Headshake!”  
- Pause/Resume/End buttons  

---

### Phase 3 — Persistence & history
**Epic: Local history**
- Save sessions to MMKV  
- Display recent sessions on home  
- Session detail modal  

---

### Phase 4 — Polish & accessibility
**Epic: UX polish**
- Animations for transitions  
- Skeleton loaders, empty states  

**Epic: Accessibility**
- Reduced haptics toggle  
- Large text mode  
- Color contrast compliance  

---

### Phase 5 — QA & release
**Epic: Testing**
- Jest unit tests (engine, RNG)  
- RN Testing Library for UI  
- Manual test matrix (low-end Android, iOS)  

---

## ✅ Acceptance Criteria

- User can **select a fish and start simulation within 1 tap**.  
- Simulation runs **≥10Hz** updates, gauges are responsive.  
- Haptics reflect events clearly; **audio is ignored for now**.  
- Session history persists after app restart.  
- No login required; works fully offline.  

---

## 🚀 Quick Start

```bash
npx create-expo-app fish-sim --template
cd fish-sim
npx expo install react-native-mmkv-expo expo-haptics expo-av react-native-svg
npm i zustand immer nativewind tailwindcss @types/react @types/react-native
npx expo install react-native-gesture-handler react-native-reanimated
npm i expo-router @expo/vector-icons
```

---

## 🔮 Future Work
- Add **audio cues** once mp3 files are ready.  
- Add **BLE IoT reel integration** (ESP32).  
- Extend fish dataset with freshwater species.  
- Export/share session history.  

---
