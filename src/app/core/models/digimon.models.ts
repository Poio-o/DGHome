export interface PlayerDigimon {
  id: string;
  userId: string;
  nickname: string;
  speciesId: string;
  speciesName: string;
  generation: string;   // 'Baby I', 'Baby II', 'Rookie', 'Champion', 'Ultimate', 'Mega'
  attribute: string;    // 'Vaccine', 'Virus', 'Data', 'Free'
  type: string;         // 'Dragon', 'Beast', 'Machine', etc.
  spriteUrl: string;
  fullImageUrl?: string;
  level: number;
  currentExp: number;
  maxExp: number;
  friendship: number;   // 0 a 100
  hunger: number;       // 0 a 100
  fatigue: number;      // 0 a 100
  talent?: number;      // 0 a 100
  isWalking: boolean;

  baseHp: number;
  baseSp: number;
  baseAtk: number;
  baseDef: number;
  baseInt: number;
  baseSpi: number;
  baseSpd: number;

  npHp: number;
  npSp: number;
  npAtk: number;
  npDef: number;
  npInt: number;
  npSpi: number;
  npSpd: number;

  bonusHp: number;
  bonusSp: number;
  bonusAtk: number;
  bonusDef: number;
  bonusInt: number;
  bonusSpi: number;
  bonusSpd: number;

  description?: string;
}
