import * as Haptics from 'expo-haptics';

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

export async function feedback(type: SimEventType, hapticsEnabled: boolean) {
  if (!hapticsEnabled) return;
  const now = Date.now();
  // Throttle repetitive pulses to ~3 Hz
  const throttle = (ms: number) => now - lastPulse > ms;

  switch (type) {
    case 'run_start':
    case 'run_tick':
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
      break;
    case 'jump':
      lastPulse = now;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'landed':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'breakoff':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
  }
}

