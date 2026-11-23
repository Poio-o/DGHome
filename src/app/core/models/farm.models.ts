import type { PlayerDigimon } from './digimon.models';

export type FarmThemeId = 'default' | 'beast' | 'bird' | 'dragon';

export interface WorldDimensions {
  width: number;  
  height: number; 
}

export interface WalkableBoundsPercent {
  minXPercent: number;
  maxXPercent: number;
  minYPercent: number;
  maxYPercent: number;
}

export interface FarmThemeConfig {
  id: FarmThemeId;
  name: string;
  badge: string;
  iconName: string;
  cloudinaryUrl: string;
  world: WorldDimensions;
  bounds: WalkableBoundsPercent;
  primaryColor: string;
  accentColor: string;
  description: string;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export type DigimonState = 'IDLE' | 'WALKING' | 'INTERACTING';

export interface Waypoint {
  x: number;
  y: number;
}

export interface FloatingParticle {
  id: string;
  worldX: number;
  worldY: number;
  text: string;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  velocityY: number;
}

export interface DigimonEntity {
  data: PlayerDigimon;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  state: DigimonState;
  stateTimer: number;
  direction: 'left' | 'right';
  scale: number;
  image: HTMLImageElement | null;
  imageLoaded: boolean;
  imageError: boolean;
  bobbingTimer: number;
  bobbingOffset: number;
  width: number;
  height: number;
  isHovered: boolean;
  isSelected: boolean;
  bubble?: {
    icon: string;
    text: string;
    timer: number;
  };
}