import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AudioService } from './audio.service';
import { DEFAULT_AUDIO_PREFERENCES } from '../models/audio.models';

describe('AudioService', () => {
  const STORAGE_KEY = 'dg_audio_preferences';
  let service: AudioService;
  let playSpy: ReturnType<typeof vi.spyOn>;
  let pauseSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    playSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve());
    pauseSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [AudioService],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('debe inicializarse con las preferencias por defecto cuando localStorage esta vacio', () => {
    service = TestBed.inject(AudioService);

    expect(service.masterVolume()).toBe(DEFAULT_AUDIO_PREFERENCES.masterVolume);
    expect(service.musicVolume()).toBe(DEFAULT_AUDIO_PREFERENCES.musicVolume);
    expect(service.sfxVolume()).toBe(DEFAULT_AUDIO_PREFERENCES.sfxVolume);
    expect(service.isMasterMuted()).toBe(false);
    expect(service.isMusicMuted()).toBe(false);
    expect(service.isSfxMuted()).toBe(false);
  });

  it('debe restaurar las preferencias guardadas previamente en localStorage y acotar valores fuera de rango', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        masterVolume: 1.5,
        musicVolume: -0.4,
        sfxVolume: 0.45,
        isMasterMuted: false,
        isMusicMuted: true,
        isSfxMuted: false,
      })
    );

    service = TestBed.inject(AudioService);

    expect(service.masterVolume()).toBe(1);
    expect(service.musicVolume()).toBe(0);
    expect(service.sfxVolume()).toBe(0.45);
    expect(service.isMusicMuted()).toBe(true);
    expect(service.effectiveMusicVolume()).toBe(0);
    expect(service.effectiveSfxVolume()).toBeCloseTo(0.45);
  });

  it('debe recuperarse sin fallar si localStorage contiene JSON corrupto', () => {
    localStorage.setItem(STORAGE_KEY, '{json_invalido');

    service = TestBed.inject(AudioService);

    expect(service.masterVolume()).toBe(DEFAULT_AUDIO_PREFERENCES.masterVolume);
    expect(service.musicVolume()).toBe(DEFAULT_AUDIO_PREFERENCES.musicVolume);
  });

  it('debe acotar los volumenes entre 0 y 1 y calcular la ganancia efectiva multiplicando por masterVolume', () => {
    service = TestBed.inject(AudioService);

    service.setMasterVolume(0.5);
    service.setMusicVolume(0.8);
    service.setSfxVolume(0.6);

    expect(service.effectiveMusicVolume()).toBeCloseTo(0.4);
    expect(service.effectiveSfxVolume()).toBeCloseTo(0.3);

    service.setMasterVolume(2);
    expect(service.masterVolume()).toBe(1);

    service.setMusicVolume(-1);
    expect(service.musicVolume()).toBe(0);
  });

  it('debe anular las ganancias efectivas al silenciar de forma independiente o maestra', () => {
    service = TestBed.inject(AudioService);
    service.setMasterVolume(0.8);
    service.setMusicVolume(0.5);
    service.setSfxVolume(0.5);

    service.toggleMusicMute();
    expect(service.isMusicMuted()).toBe(true);
    expect(service.effectiveMusicVolume()).toBe(0);
    expect(service.effectiveSfxVolume()).toBeCloseTo(0.4);

    service.toggleMusicMute();
    service.toggleSfxMute();
    expect(service.isSfxMuted()).toBe(true);
    expect(service.effectiveSfxVolume()).toBe(0);
    expect(service.effectiveMusicVolume()).toBeCloseTo(0.4);

    service.toggleSfxMute();
    service.toggleMasterMute();
    expect(service.isMasterMuted()).toBe(true);
    expect(service.effectiveMusicVolume()).toBe(0);
    expect(service.effectiveSfxVolume()).toBe(0);
  });

  it('debe persistir automaticamente los cambios en localStorage', () => {
    service = TestBed.inject(AudioService);

    service.setMasterVolume(0.35);
    service.setSfxMuted(true);
    TestBed.flushEffects();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(stored.masterVolume).toBe(0.35);
    expect(stored.isSfxMuted).toBe(true);
  });

  it('debe restablecer las preferencias por defecto al llamar a resetPreferences', () => {
    service = TestBed.inject(AudioService);

    service.setMasterVolume(0.1);
    service.setMasterMuted(true);
    service.resetPreferences();

    expect(service.masterVolume()).toBe(DEFAULT_AUDIO_PREFERENCES.masterVolume);
    expect(service.musicVolume()).toBe(DEFAULT_AUDIO_PREFERENCES.musicVolume);
    expect(service.sfxVolume()).toBe(DEFAULT_AUDIO_PREFERENCES.sfxVolume);
    expect(service.isMasterMuted()).toBe(false);
  });

  it('debe gestionar la politica de autoplay encolando el BGM y reanudandolo tras la primera interaccion', async () => {
    const autoplayError = new Error('Autoplay blocked');
    autoplayError.name = 'NotAllowedError';
    playSpy.mockRejectedValueOnce(autoplayError);

    service = TestBed.inject(AudioService);
    service.playBgm('farm_ambient');

    await Promise.resolve();
    await Promise.resolve();

    expect(service.isBgmPlaying()).toBe(false);
    expect(service.currentBgmTrack()).toBe('farm_ambient');

    playSpy.mockImplementation(() => Promise.resolve());
    document.dispatchEvent(new Event('pointerdown'));

    await Promise.resolve();
    await Promise.resolve();

    expect(service.isBgmPlaying()).toBe(true);
    service.pauseBgm();
    expect(pauseSpy).toHaveBeenCalled();
    expect(service.isBgmPlaying()).toBe(false);
  });

  it('debe invocar todos los efectos preparados (existentes y futuros) y no reproducir si SFX esta muteado', () => {
    service = TestBed.inject(AudioService);

    service.preloadSfx();
    service.playSfx('click');
    service.playSfx('feed');
    service.playSfx('success');
    service.playSfx('error');
    service.playSfx('train');
    service.playSfx('rest');
    service.playSfx('level_up');
    service.playSfx('evolution');
    service.playSfx('hatch');
    service.playSfx('step');

    expect(playSpy).toHaveBeenCalledTimes(4);

    playSpy.mockClear();
    service.setSfxMuted(true);
    service.playSfx('click');
    service.playSfx('feed');
    expect(playSpy).not.toHaveBeenCalled();
  });
});
