export type FightProfile = {
  burst_speed: number;
  initial_run_distance: number;
  jump_probability?: number;
  jump_frequency_per_min?: number;
  dive_probability?: number;
  circle_under_boat_probability?: number;
  headshake_intensity?: number;
  stamina_index: number;
  cover_or_depth_escape_tendency: string;
  typical_phases: string[];
};

export type Species = {
  id: string; // slug
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
  generated_at: string;
  units: 'relative-index-0to10';
  species: Omit<Species, 'id'>[];
};

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Session = {
  id: string;
  fishId: string;
  startedAt: number;
  durationMs: number;
  landed: boolean;
  breakoffs: number;
  difficulty: Difficulty;
};

