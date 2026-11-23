import { Injectable, computed, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import type { FarmThemeConfig, FarmThemeId } from '../models/farm.models';
import type { PlayerDigimon } from '../models/digimon.models';

const CLOUDINARY_FARMS_BASE = `${environment.cloudinaryBaseUrl}/image/upload/v1795464179/DGImages/Farms`;

export const FARM_THEMES: Record<FarmThemeId, FarmThemeConfig> = {
  default: {
    id: 'default',
    name: 'Pradera Digital',
    badge: 'BOSQUE',
    iconName: 'home',
    cloudinaryUrl: `${CLOUDINARY_FARMS_BASE}/DefaultFarmHighRes.png`,
    world: { width: 2048, height: 1080 },
    bounds: {
      minXPercent: 0.08,
      maxXPercent: 0.92,
      minYPercent: 0.20,
      maxYPercent: 0.88,
    },
    primaryColor: '#38bdf8',
    accentColor: '#10b981',
    description: 'Entorno clásico con hierba viva, arboledas y ríos digitales.',
  },
  beast: {
    id: 'beast',
    name: 'Llanura de Bestias',
    badge: 'BESTIAS',
    iconName: 'star',
    cloudinaryUrl: `${CLOUDINARY_FARMS_BASE}/BeastFarmHighRes.png`,
    world: { width: 2048, height: 1080 },
    bounds: {
      minXPercent: 0.08,
      maxXPercent: 0.92,
      minYPercent: 0.20,
      maxYPercent: 0.88,
    },
    primaryColor: '#f59e0b',
    accentColor: '#d97706',
    description: 'Sabana rocosa y templada para Digimons tipo Bestia.',
  },
  bird: {
    id: 'bird',
    name: 'Nido Celeste',
    badge: 'PÁJAROS',
    iconName: 'sparkle',
    cloudinaryUrl: `${CLOUDINARY_FARMS_BASE}/BirdFarmHighRes.png`,
    world: { width: 2048, height: 1080 },
    bounds: {
      minXPercent: 0.10,
      maxXPercent: 0.90,
      minYPercent: 0.18,
      maxYPercent: 0.86,
    },
    primaryColor: '#06b6d4',
    accentColor: '#3b82f6',
    description: 'Islas flotantes rodeadas de nubes para criaturas aéreas.',
  },
  dragon: {
    id: 'dragon',
    name: 'Volcán del Dragón',
    badge: 'DRAGÓN',
    iconName: 'fire',
    cloudinaryUrl: `${CLOUDINARY_FARMS_BASE}/DragonFarmHighRes.png`,
    world: { width: 2048, height: 1080 },
    bounds: {
      minXPercent: 0.08,
      maxXPercent: 0.92,
      minYPercent: 0.20,
      maxYPercent: 0.88,
    },
    primaryColor: '#ef4444',
    accentColor: '#b91c1c',
    description: 'Cañón volcánico con lava y magma para especies draconianas.',
  },
};

@Injectable({
  providedIn: 'root',
})
export class FarmService {
  readonly activeThemeId = signal<FarmThemeId>('default');

  readonly activeTheme = computed<FarmThemeConfig>(() => FARM_THEMES[this.activeThemeId()]);

  readonly availableThemes = signal<FarmThemeConfig[]>(Object.values(FARM_THEMES));

  readonly callToCenterTrigger = signal<number>(0);

  readonly centerCameraTrigger = signal<number>(0);

  readonly selectedEntity = signal<PlayerDigimon | null>(null);

  setTheme(themeId: FarmThemeId): void {
    if (FARM_THEMES[themeId]) {
      this.activeThemeId.set(themeId);
    }
  }

  callAllToCenter(): void {
    this.callToCenterTrigger.update((n) => n + 1);
  }

  centerCamera(): void {
    this.centerCameraTrigger.update((n) => n + 1);
  }

  selectDigimon(digimon: PlayerDigimon | null): void {
    this.selectedEntity.set(digimon);
  }
}