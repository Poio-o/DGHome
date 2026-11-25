import {
  Injectable,
  OnDestroy,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  BGM_CATALOG,
  DEFAULT_AUDIO_PREFERENCES,
  SFX_CATALOG,
  type AudioPreferences,
  type BgmTrackName,
  type SoundEffectName,
} from '../models/audio.models';

@Injectable({
  providedIn: 'root',
})
export class AudioService implements OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly STORAGE_KEY = 'dg_audio_preferences';

  private readonly prefs = this.loadPreferences();

  readonly masterVolume = signal(this.prefs.masterVolume);
  readonly musicVolume = signal(this.prefs.musicVolume);
  readonly sfxVolume = signal(this.prefs.sfxVolume);
  readonly isMasterMuted = signal(this.prefs.isMasterMuted);
  readonly isMusicMuted = signal(this.prefs.isMusicMuted);
  readonly isSfxMuted = signal(this.prefs.isSfxMuted);

  readonly currentBgmTrack = signal<BgmTrackName | null>(null);
  readonly isBgmPlaying = signal(false);

  readonly effectiveMusicVolume = computed(() =>
    this.isMasterMuted() || this.isMusicMuted()
      ? 0
      : this.clamp(this.masterVolume() * this.musicVolume())
  );

  readonly effectiveSfxVolume = computed(() =>
    this.isMasterMuted() || this.isSfxMuted()
      ? 0
      : this.clamp(this.masterVolume() * this.sfxVolume())
  );

  private bgmElement: HTMLAudioElement | null = null;
  private readonly sfxCache = new Map<string, HTMLAudioElement>();
  private readonly brokenSrcs = new Set<string>();
  private pendingBgm: BgmTrackName | null = null;
  private unlockFn: (() => void) | null = null;

  constructor() {
    effect(() => this.savePreferences());

    effect(() => {
      if (!this.bgmElement) return;
      const track = this.currentBgmTrack();
      const base = track ? (BGM_CATALOG[track]?.defaultVolume ?? 1) : 1;
      this.bgmElement.volume = this.clamp(this.effectiveMusicVolume() * base);
    });

    if (this.isBrowser) this.listenForFirstInteraction();
  }

  setMasterVolume(v: number) { this.masterVolume.set(this.clamp(v)); }
  setMusicVolume(v: number) { this.musicVolume.set(this.clamp(v)); }
  setSfxVolume(v: number) { this.sfxVolume.set(this.clamp(v)); }

  toggleMasterMute() { this.isMasterMuted.update(m => !m); }
  toggleMusicMute() { this.isMusicMuted.update(m => !m); }
  toggleSfxMute() { this.isSfxMuted.update(m => !m); }

  setMasterMuted(v: boolean) { this.isMasterMuted.set(v); }
  setMusicMuted(v: boolean) { this.isMusicMuted.set(v); }
  setSfxMuted(v: boolean) { this.isSfxMuted.set(v); }

  resetPreferences() {
    const d = DEFAULT_AUDIO_PREFERENCES;
    this.masterVolume.set(d.masterVolume);
    this.musicVolume.set(d.musicVolume);
    this.sfxVolume.set(d.sfxVolume);
    this.isMasterMuted.set(d.isMasterMuted);
    this.isMusicMuted.set(d.isMusicMuted);
    this.isSfxMuted.set(d.isSfxMuted);
  }

  playBgm(track: BgmTrackName = 'farm_ambient') {
    if (!this.isBrowser) return;
    const config = BGM_CATALOG[track];
    if (!config?.src || this.brokenSrcs.has(config.src)) return;
    if (this.currentBgmTrack() === track && this.isBgmPlaying()) return;

    this.stopBgm();
    this.currentBgmTrack.set(track);

    const el = new Audio(config.src);
    el.loop = true;
    el.volume = this.clamp(this.effectiveMusicVolume() * config.defaultVolume);
    el.addEventListener('error', () => { this.brokenSrcs.add(config.src!); this.isBgmPlaying.set(false); });
    this.bgmElement = el;

    el.play()
      .then(() => { this.isBgmPlaying.set(true); this.pendingBgm = null; })
      .catch((e: Error) => {
        this.isBgmPlaying.set(false);
        if (e.name === 'NotAllowedError') this.pendingBgm = track;
      });
  }

  pauseBgm() {
    if (this.bgmElement && !this.bgmElement.paused) this.bgmElement.pause();
    this.isBgmPlaying.set(false);
  }

  resumeBgm() {
    if (!this.bgmElement) return;
    this.bgmElement.play()
      .then(() => this.isBgmPlaying.set(true))
      .catch(() => this.isBgmPlaying.set(false));
  }

  stopBgm() {
    if (this.bgmElement) { this.bgmElement.pause(); this.bgmElement.currentTime = 0; }
    this.bgmElement = null;
    this.pendingBgm = null;
    this.isBgmPlaying.set(false);
    this.currentBgmTrack.set(null);
  }

  playSfx(name: SoundEffectName) {
    if (!this.isBrowser) return;
    const vol = this.effectiveSfxVolume();
    if (vol <= 0) return;

    const config = SFX_CATALOG[name];
    if (!config?.src || this.brokenSrcs.has(config.src)) return;

    let base = this.sfxCache.get(config.src);
    if (!base) {
      base = new Audio(config.src);
      base.preload = 'auto';
      base.addEventListener('error', () => { this.brokenSrcs.add(config.src!); this.sfxCache.delete(config.src!); });
      this.sfxCache.set(config.src, base);
    }

    const clone = base.cloneNode(true) as HTMLAudioElement;
    clone.volume = this.clamp(vol * config.defaultVolume);
    clone.play().catch(() => this.brokenSrcs.add(config.src!));
  }

  preloadSfx(list?: SoundEffectName[]) {
    if (!this.isBrowser) return;
    for (const name of list ?? Object.keys(SFX_CATALOG) as SoundEffectName[]) {
      const src = SFX_CATALOG[name]?.src;
      if (!src || this.brokenSrcs.has(src) || this.sfxCache.has(src)) continue;
      const a = new Audio(src);
      a.preload = 'auto';
      a.addEventListener('error', () => { this.brokenSrcs.add(src); this.sfxCache.delete(src); });
      this.sfxCache.set(src, a);
    }
  }

  ngOnDestroy() {
    this.stopBgm();
    this.removeUnlockListeners();
    this.sfxCache.clear();
  }

  private listenForFirstInteraction() {
    this.unlockFn = () => {
      if (this.pendingBgm) { const t = this.pendingBgm; this.pendingBgm = null; this.playBgm(t); }
      this.removeUnlockListeners();
    };
    for (const ev of ['pointerdown', 'keydown', 'touchstart'] as const)
      document.addEventListener(ev, this.unlockFn, { passive: true });
  }

  private removeUnlockListeners() {
    if (!this.unlockFn) return;
    for (const ev of ['pointerdown', 'keydown', 'touchstart'] as const)
      document.removeEventListener(ev, this.unlockFn!);
    this.unlockFn = null;
  }

  private loadPreferences(): AudioPreferences {
    if (!this.isBrowser) return { ...DEFAULT_AUDIO_PREFERENCES };
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return { ...DEFAULT_AUDIO_PREFERENCES };
      const p = JSON.parse(raw) as Partial<AudioPreferences>;
      return {
        masterVolume: this.num(p.masterVolume, DEFAULT_AUDIO_PREFERENCES.masterVolume),
        musicVolume: this.num(p.musicVolume, DEFAULT_AUDIO_PREFERENCES.musicVolume),
        sfxVolume: this.num(p.sfxVolume, DEFAULT_AUDIO_PREFERENCES.sfxVolume),
        isMasterMuted: p.isMasterMuted === true,
        isMusicMuted: p.isMusicMuted === true,
        isSfxMuted: p.isSfxMuted === true,
      };
    } catch { return { ...DEFAULT_AUDIO_PREFERENCES }; }
  }

  private savePreferences() {
    if (!this.isBrowser) return;
    const data: AudioPreferences = {
      masterVolume: this.masterVolume(), musicVolume: this.musicVolume(),
      sfxVolume: this.sfxVolume(), isMasterMuted: this.isMasterMuted(),
      isMusicMuted: this.isMusicMuted(), isSfxMuted: this.isSfxMuted(),
    };
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); } catch { }
  }

  private num(v: unknown, fb: number): number {
    return typeof v === 'number' && !isNaN(v) ? this.clamp(v) : fb;
  }

  private clamp(v: number, min = 0, max = 1): number {
    return Math.min(max, Math.max(min, v));
  }
}
