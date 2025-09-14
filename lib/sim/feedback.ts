import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';
import type { HapticsMode } from '@/lib/store';

export type SimEventType =
  | 'run_start'
  | 'run_tick'
  | 'headshake'
  | 'jump'
  | 'dive'
  | 'circle_tick'
  | 'landed'
  | 'breakoff';

let lastPulse = 0;
let mutedUntil = 0;
let continuousOn = false;

export function stopContinuous() {
  if (continuousOn) {
    Vibration.cancel();
    continuousOn = false;
  }
}

export async function feedback(
  type: SimEventType,
  hapticsEnabled: boolean,
  mode: HapticsMode = 'subtle',
  tension?: number
) {
  if (!hapticsEnabled) return;
  const now = Date.now();
  const throttle = (ms: number) => now - lastPulse > ms && now > mutedUntil;

  // Background subtle buzz while pulling
  if ((type === 'run_tick' || type === 'circle_tick') && mode !== 'android_continuous') {
    const t = Math.max(0, Math.min(1, tension ?? 0));
    // Map tension 0..1 → interval 600..220 ms
    const interval = 600 - t * 380;
    const jitter = (Math.random() - 0.5) * 80; // ±40ms
    if (throttle(interval + jitter)) {
      lastPulse = now;
      if (mode === 'subtle') {
        await Haptics.selectionAsync();
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    return;
  }

  // Android optional continuous background
  if ((type === 'run_tick' || type === 'circle_tick') && mode === 'android_continuous' && Platform.OS === 'android') {
    if (!continuousOn) {
      // Very light repeating pattern
      Vibration.vibrate([0, 15, 185], true);
      continuousOn = true;
    }
    return;
  }

  switch (type) {
    case 'run_start':
    case 'circle_tick':
      if (throttle(300)) {
        lastPulse = now;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      break;
    case 'headshake':
    case 'dive':
      lastPulse = now;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      mutedUntil = now + 400; // let event stand out
      break;
    case 'jump':
      lastPulse = now;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mutedUntil = now + 300;
      break;
    case 'landed':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      mutedUntil = now + 600;
      stopContinuous();
      break;
    case 'breakoff':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      mutedUntil = now + 600;
      stopContinuous();
      break;
  }
}
