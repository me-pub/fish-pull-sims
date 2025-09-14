import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Difficulty } from '@/lib/types';

// MMKV wrapper if available, fallback to in-memory map
let storageImpl: { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void; removeItem: (k: string) => void };

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require('react-native-mmkv');
  const mmkv = new MMKV();
  storageImpl = {
    getItem: (name) => mmkv.getString(name) ?? null,
    setItem: (name, value) => mmkv.set(name, value),
    removeItem: (name) => mmkv.delete(name),
  };
} catch {
  const mem = new Map<string, string>();
  storageImpl = {
    getItem: (k) => mem.get(k) ?? null,
    setItem: (k, v) => void mem.set(k, v),
    removeItem: (k) => void mem.delete(k),
  };
}

export type HapticsMode = 'subtle' | 'detailed' | 'android_continuous';

type SettingsState = {
  hapticsEnabled: boolean;
  difficulty: Difficulty;
  lastFishId: string | null;
  hapticsMode: HapticsMode;
  setHaptics: (v: boolean) => void;
  setDifficulty: (d: Difficulty) => void;
  setLastFishId: (id: string | null) => void;
  setHapticsMode: (m: HapticsMode) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      hapticsEnabled: true,
      hapticsMode: 'subtle',
      difficulty: 'medium',
      lastFishId: null,
      setHaptics: (v) => set({ hapticsEnabled: v }),
      setDifficulty: (d) => set({ difficulty: d }),
      setLastFishId: (id) => set({ lastFishId: id }),
      setHapticsMode: (m) => set({ hapticsMode: m }),
    }),
    {
      name: 'settings.v1',
      storage: createJSONStorage(() => storageImpl),
      partialize: (s) => ({ hapticsEnabled: s.hapticsEnabled, hapticsMode: s.hapticsMode, difficulty: s.difficulty, lastFishId: s.lastFishId }),
    }
  )
);
