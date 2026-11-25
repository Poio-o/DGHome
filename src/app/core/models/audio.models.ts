export type SoundEffectName =
  | 'click'
  | 'feed'
  | 'error'
  | 'success'
  | 'train'
  | 'rest'
  | 'level_up'
  | 'evolution'
  | 'hatch'
  | 'step';

export type BgmTrackName = 'farm_ambient' | 'training_theme' | 'menu_theme';

export interface AudioPreferences {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMasterMuted: boolean;
  isMusicMuted: boolean;
  isSfxMuted: boolean;
}

export interface SoundEffectConfig {
  name: SoundEffectName;
  src: string | null;
  defaultVolume: number;
  fallbackFreq: number;
  fallbackDurationMs: number;
  fallbackType: OscillatorType;
}

export interface BgmTrackConfig {
  name: BgmTrackName;
  title: string;
  src: string | null;
  defaultVolume: number;
}

export const DEFAULT_AUDIO_PREFERENCES: AudioPreferences = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.9,
  isMasterMuted: false,
  isMusicMuted: false,
  isSfxMuted: false,
};

export const SFX_CATALOG: Record<SoundEffectName, SoundEffectConfig> = {
  click: {
    name: 'click',
    src: '/assets/audio/sfx/click.mp3',
    defaultVolume: 0.7,
    fallbackFreq: 660,
    fallbackDurationMs: 45,
    fallbackType: 'sine',
  },
  feed: {
    name: 'feed',
    src: '/assets/audio/sfx/feed.mp3',
    defaultVolume: 0.85,
    fallbackFreq: 523.25,
    fallbackDurationMs: 120,
    fallbackType: 'triangle',
  },
  error: {
    name: 'error',
    src: '/assets/audio/sfx/error.mp3',
    defaultVolume: 0.8,
    fallbackFreq: 196,
    fallbackDurationMs: 180,
    fallbackType: 'sawtooth',
  },
  success: {
    name: 'success',
    src: '/assets/audio/sfx/success.mp3',
    defaultVolume: 0.85,
    fallbackFreq: 783.99,
    fallbackDurationMs: 150,
    fallbackType: 'triangle',
  },
  train: {
    name: 'train',
    src: null,
    defaultVolume: 0.8,
    fallbackFreq: 440,
    fallbackDurationMs: 100,
    fallbackType: 'square',
  },
  rest: {
    name: 'rest',
    src: null,
    defaultVolume: 0.75,
    fallbackFreq: 392,
    fallbackDurationMs: 180,
    fallbackType: 'sine',
  },
  level_up: {
    name: 'level_up',
    src: null,
    defaultVolume: 0.9,
    fallbackFreq: 880,
    fallbackDurationMs: 220,
    fallbackType: 'triangle',
  },
  evolution: {
    name: 'evolution',
    src: null,
    defaultVolume: 0.95,
    fallbackFreq: 987.77,
    fallbackDurationMs: 300,
    fallbackType: 'triangle',
  },
  hatch: {
    name: 'hatch',
    src: null,
    defaultVolume: 0.9,
    fallbackFreq: 659.25,
    fallbackDurationMs: 200,
    fallbackType: 'sine',
  },
  step: {
    name: 'step',
    src: null,
    defaultVolume: 0.6,
    fallbackFreq: 329.63,
    fallbackDurationMs: 40,
    fallbackType: 'sine',
  },
};

export const BGM_CATALOG: Record<BgmTrackName, BgmTrackConfig> = {
  farm_ambient: {
    name: 'farm_ambient',
    title: 'Granja Digital',
    src: '/assets/audio/bgm/Cookie_Run_Kingdom_OST_Farm__BGM.mp3',
    defaultVolume: 0.5,
  },
  training_theme: {
    name: 'training_theme',
    title: 'Zona de Entrenamiento',
    src: null,
    defaultVolume: 0.55,
  },
  menu_theme: {
    name: 'menu_theme',
    title: 'Menú Principal',
    src: null,
    defaultVolume: 0.45,
  },
};
