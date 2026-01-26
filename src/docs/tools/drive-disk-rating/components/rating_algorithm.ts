// 驱动盘评分算法实现
import { getCharacterWeights } from './character-weights.ts';

import type { CharacterWeightConfig } from './character-weights.ts';


// 1. 角色有效词条权重配置（从 character-weights.ts 导入）
interface RoleConfig {
  [roleName: string]: CharacterWeightConfig;
}

// 2. 驱动盘数据类型定义
interface SubProperty {
  name: string;
  value: string;
  level: number;
  valid: boolean;
  add: number;
}

interface MainProperty {
  name: string;
  value: string;
}

interface DriveDisc {
  position: number;
  name: string;
  level: number;
  rarity: 'S' | 'A' | 'B';
  invalidProperty: number;
  mainProperty: MainProperty;
  subProperties: SubProperty[];
}

interface CharacterData {
  characterName: string;
  characterFullName: string;
  level: number;
  profession: number;
  driveDiscs: DriveDisc[];
}

// 3. 计算单个驱动盘评分
function calculateDriveDiscScore(
driveDisc: DriveDisc,
roleName: string = 'default'
): { 
  score: number; 
  subPropertiesWeight: number; 
  mainPropertyWeight: number; 
  maxWeightSum: number; 
  validProperties: any[]; 
  qualityWeight: number; 
  levelWeight: number; 
} {
  // 确保driveDisc是有效的对象
  if (!driveDisc) {
    return {
      score: 0,
      subPropertiesWeight: 0,
      mainPropertyWeight: 0,
      maxWeightSum: 0,
      validProperties: [],
      qualityWeight: 0,
      levelWeight: 0
    };
  }
  
  const weightConfig = getCharacterWeights(roleName);
  
  // 步骤1：计算品质权重
  const rarity = driveDisc.rarity || 'S';
  const qualityWeight = {
    'S': 1,
    'A': 0.67,
    'B': 0.33
  }[rarity] || 1;
  
  // 步骤2：计算主词条等级权重（0级0.25，每升1级+0.05，15级达1）
  const level = driveDisc.level || 0;
  const levelWeight = Math.min(0.25 + level * 0.05, 1);
  
  // 步骤3：计算实际有效副词条权重总和
  const subProperties = Array.isArray(driveDisc.subProperties) ? driveDisc.subProperties : [];
  const validSubProperties = subProperties.filter(prop => {
    // 动态计算 valid 状态（根据角色权重配置）
    let propertyName = prop.name;
    
    // 如果属性值不包含%，且是生命值/攻击力/防御力，则视为小属性
    if (!prop.value.includes('%') && ['生命值', '攻击力', '防御力'].includes(prop.name)) {
      if (prop.name === '攻击力') {
        propertyName = '小攻击';
      } else if (prop.name === '生命值') {
        propertyName = '小生命';
      } else if (prop.name === '防御力') {
        propertyName = '小防御';
      }
    }
    
    // 获取该属性的权重
    const weight = weightConfig[propertyName] || 0;
    
    // 如果权重 > 0，则视为有效词条
    return weight > 0;
  });
  
  let subPropertiesWeight = 0;
  const validProps: Array<{
    name: string;
    value: string;
    weight: number;
    add: number;
    weightedValue: number;
  }> = [];
  
  validSubProperties.forEach(prop => {
    // 根据数值类型区分大属性和小属性
    let propertyName = prop.name;
    
    // 如果属性值不包含%，且是生命值/攻击力/防御力，则视为小属性
    if (!prop.value.includes('%') && ['生命值', '攻击力', '防御力'].includes(prop.name)) {
      if (prop.name === '攻击力') {
        propertyName = '小攻击';
      } else if (prop.name === '生命值') {
        propertyName = '小生命';
      } else if (prop.name === '防御力') {
        propertyName = '小防御';
      }
    }
    
    const weight = weightConfig[propertyName] || 0;
    const addValue = prop.add || 0;
    const weightedValue = weight + addValue * weight;
    subPropertiesWeight += weightedValue;
    
    // 添加到有效属性列表
    validProps.push({
      name: prop.name,
      value: prop.value,
      weight: weight,
      add: addValue,
      weightedValue: weightedValue
    });
    
    // 输出调试信息
    console.log(`位置${driveDisc.position} - 副词条: ${prop.name}(${prop.value}) -> 匹配: ${propertyName}, 权重: ${weight}, add: ${addValue}, 加权值: ${weightedValue}`);
  });
  
  // 确保position是有效的数字
  const position = typeof driveDisc.position === 'number' ? driveDisc.position : 1;
  
  // 确保mainProperty是有效的对象
  const mainProperty = driveDisc.mainProperty || { name: '', value: '' };
  
  // 步骤4：处理4~6号位主词条实际等值权重
  let mainPropertyWeight = 0;
  if (position >= 4 && position <= 6) {
    // 4~6号位主词条等值3条副词条，权重为3 × 主属性权重 × 等级权重
    const mainPropWeight = weightConfig[mainProperty.name] || 0;
    mainPropertyWeight = 3 * mainPropWeight * levelWeight;
  }
  
  // 步骤5：计算该部位的最高词条数总和
  // 副词条最大有效条数 + 主属性最大有效条数
  
  // 计算当前驱动盘副词条理想最大有效条数
  const excludeKeywords = ['伤害加成', '异常掌控', '穿透率', '能量自动回复'];
  const validWeights = Object.entries(weightConfig)
    .filter(([name]) => !excludeKeywords.some(keyword => name.includes(keyword)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([_, weight]) => weight);
  
  const first = validWeights[0] || 0;
  const second = validWeights[1] || 0;
  const third = validWeights[2] || 0;
  const fourth = validWeights[3] || 0;
  const subPropertyMax = 6 * first + 1 * second + 1 * third + 1 * fourth;
  
  // 计算当前驱动盘主属性理想最大有效条数
  const mainPropertyName = mainProperty.name;
  const mainPropWeight = weightConfig[mainPropertyName] || 0;
  
  // 4-6号位主属性最大有效条数
  // 如果主属性权重为0，视为2条（无效词条）
  // 如果主属性权重>0，视为3条
  let mainPropertyMax = 0;
  if (position >= 4 && position <= 6) {
    if (mainPropWeight === 0) {
      mainPropertyMax = 2; // 当主属性权重为0时，视为2条有效词条
    } else {
      mainPropertyMax = 3 * mainPropWeight;
    }
  }
  
  // 最高词条数总和
  const maxWeightSum = subPropertyMax + mainPropertyMax;
  
  // 输出调试信息
  console.log(`位置${position} - 副词条最大: ${subPropertyMax.toFixed(4)}, 主属性最大: ${mainPropertyMax.toFixed(4)}, 总和: ${maxWeightSum.toFixed(4)}`);
  
  // 步骤6：计算每1权重有效词条分值
  const scorePerWeight = 55 / maxWeightSum;
  
  // 输出调试信息
  console.log(`位置${position} - 每权重分值: ${scorePerWeight.toFixed(4)}`);
  
  // 步骤7：计算实际分值
  const actualScore = (subPropertiesWeight + mainPropertyWeight) * scorePerWeight * qualityWeight;
  
  // 输出调试信息
  console.log(`位置${position} - 实际得分: ${actualScore.toFixed(4)} (副词条权重: ${subPropertiesWeight.toFixed(4)} + 主属性权重: ${mainPropertyWeight.toFixed(4)}) × 每权重分值: ${scorePerWeight.toFixed(4)} × 品质权重: ${qualityWeight.toFixed(4)}`);
  
  return {
    score: Math.round(actualScore * 10) / 10, // 保留一位小数
    subPropertiesWeight,
    mainPropertyWeight,
    maxWeightSum,
    validProperties: validProps,
    qualityWeight,
    levelWeight
  };
}

// 4. 计算角色全套驱动盘评分
function calculateCharacterTotalScore(
  characterData: CharacterData
): {
  totalScore: number;
  discScores: { [position: number]: number };
  discDetails: Array<{
    position: number;
    name: string;
    level: number;
    rarity: string;
    mainProperty: MainProperty;
    score: number;
    details: any;
  }>;
} {
  const discScores: { [position: number]: number } = {};
  const discDetails: Array<{
    position: number;
    name: string;
    level: number;
    rarity: string;
    mainProperty: MainProperty;
    score: number;
    details: any;
  }> = [];
  let totalScore = 0;
  
  // 确保driveDiscs是一个数组
  const driveDiscs = Array.isArray(characterData.driveDiscs) ? characterData.driveDiscs : [];
  
  driveDiscs.forEach(driveDisc => {
    const result = calculateDriveDiscScore(driveDisc, characterData.characterName);
    discScores[driveDisc.position] = result.score;
    totalScore += result.score;
    
    discDetails.push({
      position: driveDisc.position,
      name: driveDisc.name,
      level: driveDisc.level,
      rarity: driveDisc.rarity,
      mainProperty: driveDisc.mainProperty,
      score: result.score,
      details: result
    });
  });
  
  // 确保所有6个部位都计算到（缺失部位计0分）
  for (let i = 1; i <= 6; i++) {
    if (discScores[i] === undefined) {
      discScores[i] = 0;
    }
  }
  
  return {
    totalScore: Math.round(totalScore * 10) / 10, // 保留一位小数
    discScores,
    discDetails
  };
}

// 5. 计算所有角色的评分
function calculateAllCharactersScore(
  charactersData: CharacterData[]
): Array<{
  characterName: string;
  totalScore: number;
  discScores: { [position: number]: number };
}> {
  return charactersData.map(character => {
    const { totalScore, discScores } = calculateCharacterTotalScore(character);
    return {
      characterName: character.characterFullName,
      totalScore,
      discScores
    };
  });
}

// 6. 导出函数
export {
 calculateDriveDiscScore,
 calculateCharacterTotalScore,
 calculateAllCharactersScore
};

export type {
 CharacterData,
 DriveDisc,
 RoleConfig
};

// 重新导出 character-weights 中的内容
export { getCharacterWeights, characterWeights } from './character-weights.ts';
export type { CharacterWeightConfig } from './character-weights.ts';

