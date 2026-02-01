// 驱动盘评分系统类型定义

// 1. 副词条
export interface SubProperty {
  name: string;
  value: string;
  level: number;
  valid: boolean;
  add: number;
}

// 2. 主词条
export interface MainProperty {
  name: string;
  value: string;
}

// 3. 驱动盘数据
export interface DriveDisc {
  position: number;
  name: string;
  level: number;
  rarity: "S" | "A" | "B";
  invalidProperty: number;
  mainProperty: MainProperty;
  subProperties: SubProperty[];
}

// 4. 角色数据
export interface CharacterData {
  characterName: string;
  characterFullName: string;
  level: number;
  profession: number;
  driveDiscs: DriveDisc[];
}

// 5. 驱动盘评分结果
export interface DriveDiscScoreResult {
  score: number;
  subPropertiesWeight: number;
  mainPropertyWeight: number;
  maxWeightSum: number;
  maxWeightFormula: string;
  validProperties: Array<{
    name: string;
    value: string;
    weight: number;
    add: number;
    weightedValue: number;
  }>;
  qualityWeight: number;
  levelWeight: number;
}

// 6. 角色全套驱动盘评分结果
export interface CharacterScoreResult {
  totalScore: number;
  discScores: { [position: number]: number };
  discDetails: Array<{
    position: number;
    name: string;
    level: number;
    rarity: string;
    mainProperty: MainProperty;
    score: number;
    details: DriveDiscScoreResult;
  }>;
}

// 7. 所有角色评分结果
export interface AllCharactersScoreResult {
  characterName: string;
  totalScore: number;
  discScores: { [position: number]: number };
}
