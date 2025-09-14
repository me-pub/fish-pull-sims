import { useEffect, useMemo, useRef, useState } from 'react';
import type { Difficulty, Species } from '@/lib/types';
import { feedback, type SimEventType } from '@/lib/sim/feedback';

export type SimPhase = 'running' | 'headshake' | 'jumping' | 'diving' | 'circling' | 'landed' | 'breakoff';

export type SimSnapshot = {
  t: number; // ms elapsed
  tension: number; // 0..1
  lineOut: number; // 0..1
  stamina: number; // 0..1
  phase: SimPhase;
  lastEvent?: SimEventType;
};

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

function diffPreset(difficulty: Difficulty) {
  if (difficulty === 'easy') return { decay: 0.7, breakMs: 350, jumpLoss: 0.6 };
  if (difficulty === 'hard') return { decay: 1.3, breakMs: 150, jumpLoss: 1.4 };
  return { decay: 1.0, breakMs: 250, jumpLoss: 1.0 };
}

export function useSimulation(species: Species, difficulty: Difficulty, hapticsEnabled: boolean) {
  const [snapshot, setSnapshot] = useState<SimSnapshot>({ t: 0, tension: 0, lineOut: 0, stamina: 1, phase: 'running' });
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState<null | 'landed' | 'breakoff'>(null);
  const seedRef = useRef( (species.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 9973) + 1 );
  const sinceOverRef = useRef(0);

  const params = useMemo(() => {
    const fp = species.fight_profile;
    const f = (n?: number) => (n ?? 0) / 10;
    return {
      burst: f(fp.burst_speed),
      run0: f(fp.initial_run_distance),
      jumpProb: f(fp.jump_probability),
      jumpFreq: f(fp.jump_frequency_per_min) / 60, // per sec
      diveProb: f(fp.dive_probability),
      circleProb: f(fp.circle_under_boat_probability),
      shake: f(fp.headshake_intensity),
      stamina: f(fp.stamina_index),
    };
  }, [species]);

  const preset = useMemo(() => diffPreset(difficulty), [difficulty]);

  useEffect(() => {
    setSnapshot({ t: 0, tension: 0, lineOut: params.run0 * 0.2, stamina: clamp01(0.6 + params.stamina * 0.4), phase: 'running' });
    setDone(null);
    sinceOverRef.current = 0;
  }, [species.id, params.run0, params.stamina]);

  useEffect(() => {
    if (done || paused) return;
    let mounted = true;
    const dt = 50; // ms (20 Hz)
    let overMs = 0;
    const timer = setInterval(() => {
      if (!mounted) return;
      // RNG: simple LCG
      seedRef.current = (seedRef.current * 1103515245 + 12345) & 0x7fffffff;
      const rnd = () => (seedRef.current % 10000) / 10000;

      setSnapshot((s) => {
        if (done) return s;
        let { tension, lineOut, stamina, phase } = s;
        let lastEvent: SimEventType | undefined;

        // Baseline force from burst/stamina
        const baseForce = params.burst * (0.4 + 0.6 * stamina);
        let targetTension = baseForce;

        // Random events
        if (phase !== 'jumping' && params.jumpProb > 0 && rnd() < params.jumpProb * 0.02) {
          phase = 'jumping';
          // slack then recover
          targetTension *= 0.3;
          lastEvent = 'jump';
          stamina = clamp01(stamina - 0.02 * preset.jumpLoss);
        } else if (phase !== 'diving' && params.diveProb > 0 && rnd() < params.diveProb * 0.015) {
          phase = 'diving';
          targetTension *= 1.2;
          lastEvent = 'dive';
          lineOut = clamp01(lineOut + 0.03);
        } else if (phase !== 'headshake' && params.shake > 0 && rnd() < params.shake * 0.02) {
          phase = 'headshake';
          targetTension *= 1.1;
          lastEvent = 'headshake';
        } else if (phase !== 'circling' && params.circleProb > 0 && rnd() < params.circleProb * 0.01) {
          phase = 'circling';
          targetTension *= 0.9;
          lastEvent = 'circle_tick';
        } else {
          phase = 'running';
        }

        // Drift tension toward target
        tension = clamp01(tension + (targetTension - tension) * 0.25);

        // Line out behavior
        const runPush = params.run0 * (0.008 + 0.01 * stamina);
        lineOut = clamp01(lineOut + runPush - tension * 0.01);

        // Stamina decay
        stamina = clamp01(stamina - 0.0025 * preset.decay - tension * 0.0015 * preset.decay);

        // Breakoff if sustained over-tension
        if (tension > 0.92) {
          overMs += dt;
        } else {
          overMs = 0;
        }

        if (overMs >= preset.breakMs) {
          phase = 'breakoff';
        }

        // Landed when stamina low and line retrieved
        if (stamina < 0.05 && lineOut < 0.05 && phase !== 'breakoff') {
          phase = 'landed';
        }

        const next: SimSnapshot = {
          t: s.t + dt,
          tension,
          lineOut,
          stamina,
          phase,
          lastEvent,
        };

        return next;
      });
    }, dt);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [done, paused, params.burst, params.circleProb, params.diveProb, params.jumpProb, params.run0, params.shake, preset.breakMs, preset.decay, preset.jumpLoss]);

  // Observe snapshot to produce feedback and end conditions
  useEffect(() => {
    if (snapshot.lastEvent) feedback(snapshot.lastEvent, hapticsEnabled);
    if (snapshot.phase === 'landed' || snapshot.phase === 'breakoff') {
      setDone(snapshot.phase);
      feedback(snapshot.phase, hapticsEnabled);
    } else if (snapshot.phase === 'running') {
      feedback('run_tick', hapticsEnabled);
    } else if (snapshot.phase === 'circling') {
      feedback('circle_tick', hapticsEnabled);
    }
  }, [snapshot.lastEvent, snapshot.phase, hapticsEnabled]);

  return {
    snapshot,
    paused,
    done,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
    end: (why: 'landed' | 'breakoff') => setDone(why),
    reset: () => {
      setSnapshot({ t: 0, tension: 0, lineOut: 0, stamina: 1, phase: 'running' });
      setDone(null);
      setPaused(false);
    },
  } as const;
}

