// 驱动盘评分系统类型定义

// 1. 副词条
export interface SubProperty {
  name: string;
  value: string;
  level: number;
  valid: boolean;
  add: number;
}

// 1.1 有效副词条详情
export interface ValidPropertyDetail {
  name: string;
  value: string;
  weight: number;
  add: number;
  weightedValue: number;
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
  rarity: 'S' | 'A' | 'B';
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

// 4.1 所有角色驱动盘词条权重配置集合
// 数值表示该词条的权重占比，1为最高权重，0为无效词条
export interface CharacterWeightConfig {
  [characterName: string]: {
    [propertyName: string]: number;
  };
}

// 5. 驱动盘等级结果
export interface GradeResult {
  grade: string;
  gradeClass: string;
  gradeDesc: string;
}

//6.最大权重信息
export interface MaxWeightInfo {
  subPropertyMax: number;     // 副词条最大权重
  mainPropertyMax: number;     // 主词条最大权重
  maxWeightSum: number;        // 最高权重总和
  maxWeightFormula: string;    // 最大权重公式字符串
}

// 6. 单个驱动盘评分结果
export interface DriveDiscScoreResult {
  score: number;
  subPropertiesWeight: number;
  mainPropertyWeight: number;
  maxWeightInfo: MaxWeightInfo;
  validProperties: ValidPropertyDetail[];
  qualityWeight: number;
  levelWeight: number;
  gradeResult?: GradeResult;
}

// 7. 角色全套驱动盘评分结果
export interface CharacterScoreResult {
  totalScore: number;
  discScores: { [position: number]: number };// 每个位置的驱动盘评分
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
