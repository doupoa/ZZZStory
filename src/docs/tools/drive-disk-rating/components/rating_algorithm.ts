// 驱动盘评分算法实现
import type {
  SubProperty,
  MainProperty,
  DriveDisc,
  CharacterData,
  DriveDiscScoreResult,
  CharacterScoreResult,
  AllCharactersScoreResult
} from './types.ts';

// 角色驱动盘词条权重配置
// 数值表示该词条的权重占比，1为最高权重，0为无效词条
export interface CharacterWeightConfig {
  [characterName: string]: {
    [propertyName: string]: number;
  };
}

// 从 JSON 文件导入角色权重配置
import characterWeightsData from './character_weight.json';

export const characterWeights: CharacterWeightConfig = characterWeightsData;

// 获取角色权重配置
export function getCharacterWeights(characterName: string): {
  [propertyName: string]: number;
} {
  // 尝试获取精确匹配的角色配置
  if (characterWeights[characterName]) {
    return characterWeights[characterName];
  }

  // 尝试使用角色全名的一部分进行匹配
  const matchingCharacter = Object.keys(characterWeights).find(
    name => characterName.includes(name) || name.includes(characterName)
  );

  if (matchingCharacter) {
    return characterWeights[matchingCharacter];
  }
  //1:强攻 2:击破 3:异常 4:支援 5:防护 6:命破

  // 如果没有找到匹配的角色，返回默认配置（输出型角色）
  return characterWeights['叶瞬光'];
}

// 获取所有已配置的角色名称列表
export function getConfiguredCharacters(): string[] {
  return Object.keys(characterWeights);
}

// 从 JSON 文件导入角色元素映射配置
import characterElementMapping from './Character_Stat_Damage_Mapping_Table.json';

// 获取角色属性
export function getCharacterElement(characterName: string): string {
  // 遍历所有元素类型，查找包含该角色的元素
  for (const [element, characters] of Object.entries(characterElementMapping)) {
    // 跳过 ELEMENTS 和 ELEMENT_MAPPING 字段
    if (element === 'ELEMENTS' || element === 'ELEMENT_MAPPING') {
      continue;
    }
    
    // 检查该元素是否包含指定角色
    if (Array.isArray(characters) && characters.includes(characterName)) {
      return element;
    }
  }
  
  // 如果没有找到匹配的角色，返回默认值
  return '物理';
}

// 1. 品质权重配置
export const QUALITY_WEIGHTS: Record<string, number> = {
  'S': 1,
  'A': 0.67,
  'B': 0.33
};

// 2. 定义每个部位的主词条可选池
export const SLOT_MAIN_POOLS: Record<number, string[]> = {
  1: ['生命值'],           // 1号位固定主词条
  2: ['攻击力'],          // 2号位固定主词条
  3: ['防御力'],         // 3号位固定主词条
  4: ['攻击力', '生命值', '防御力', '暴击率', '暴击伤害', '异常精通'],  // 4号位可选主词条
  5: ['攻击力', '生命值', '防御力', '穿透率', '属性伤害'],  // 5号位可选主词条
  6: ['攻击力', '生命值', '防御力', '异常掌控', '冲击力', '能量自动回复'],  // 6号位可选主词条
};

// 3. 定义副词条可选池
export const SUB_STATS_POOL: string[] = [
  '生命值',
  '攻击力',
  '防御力',
  '暴击率',
  '暴击伤害',
  '异常精通',
  '穿透值',
  '小生命',
  '小攻击',
  '小防御'
];



// 4. 角色有效词条权重配置（从 character-weights.ts 导入）
interface RoleConfig {
  [roleName: string]: CharacterWeightConfig;
}

// 3. 计算单个驱动盘评分
function calculateDriveDiscScore(
driveDisc: DriveDisc,
roleName: string = 'default'
): DriveDiscScoreResult {
  // 确保driveDisc是有效的对象
  if (!driveDisc) {
    return {
      score: 0,
      subPropertiesWeight: 0,
      mainPropertyWeight: 0,
      maxWeightSum: 0,
      maxWeightFormula: '',
      validProperties: [],
      qualityWeight: 0,
      levelWeight: 0
    };
  }
  
  const weightConfig = getCharacterWeights(roleName);
  
  // 步骤1：计算品质权重
  const rarity = driveDisc.rarity || 'S';
  const qualityWeight = QUALITY_WEIGHTS[rarity] || 1;
  
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
  
  // 5.1 排序副词条权重（从高到低）
  const availableSubWeights = SUB_STATS_POOL
    .filter((stat) => weightConfig[stat] > 0)
    .map((stat) => [stat, weightConfig[stat]] as [string, number])
    .sort((a, b) => b[1] - a[1]);
  
  // 5.2 排序主词条权重（从高到低）
  const slotKey = position as keyof typeof SLOT_MAIN_POOLS;
  const availableMainWeights = (SLOT_MAIN_POOLS[slotKey] || [])
    .filter((stat) => weightConfig[stat] > 0)
    .map((stat) => [stat, weightConfig[stat]] as [string, number])
    .sort((a, b) => b[1] - a[1]);
  
  let subPropertyMax = 0;
  let mainPropertyMax = 0;
  let maxWeightFormula = '';
  
  // 5.3 按部位计算权重
  if (position >= 1 && position <= 3) {
    // 1-3号位：主属性不参与计算
    mainPropertyMax = 0;
    // 副词条最大权重 = 前4个副词条权重之和 + 5倍最大副词条权重
    subPropertyMax = (availableSubWeights[0]?.[1] || 0) + 
                     (availableSubWeights[1]?.[1] || 0) + 
                     (availableSubWeights[2]?.[1] || 0) + 
                     (availableSubWeights[3]?.[1] || 0) + 
                     5 * (availableSubWeights[0]?.[1] || 0);
    
    // 构建公式字符串
    const subStatNames = [
      `${availableSubWeights[0]?.[0] || ''}(权重${availableSubWeights[0]?.[1] || 0})`,
      `${availableSubWeights[1]?.[0] || ''}(权重${availableSubWeights[1]?.[1] || 0})`,
      `${availableSubWeights[2]?.[0] || ''}(权重${availableSubWeights[2]?.[1] || 0})`,
      `${availableSubWeights[3]?.[0] || ''}(权重${availableSubWeights[3]?.[1] || 0})`
    ].filter(s => s.trim() !== '');
    
    maxWeightFormula = `副属性-${subStatNames.join('+')}+5*${availableSubWeights[0]?.[0] || ''}(权重${availableSubWeights[0]?.[1] || 0})`;
  }
  
  if (position >= 4 && position <= 6) {
    // 4-6号位：遍历所有可能的主属性（包括主属性权重为0的情况），选择权重最大的组合
    let maxTotalWeight = 0;
    let bestMainStat = '';
    let bestMainWeight = 0;
    let bestSubWeights: [string, number][] = [];
    
    // 获取当前位置的所有主词条（包括权重为0的）
    const allMainStats = SLOT_MAIN_POOLS[slotKey] || [];
    
    // 遍历所有主属性（包括权重为0的）
    for (const mainStat of allMainStats) {
      const mainWeight = weightConfig[mainStat] || 0;
      const currentMainStatWeight = 3 * mainWeight; // 主属性权重为3倍（权重为0时也为0）
      
      // 过滤掉与主属性名称相同的副词条
      const filteredSubWeights = availableSubWeights.filter(([stat]) => stat !== mainStat);
      
      // 计算当前主属性下副词条的最大权重
      const currentSubStatsWeight = (filteredSubWeights[0]?.[1] || 0) + 
                                    (filteredSubWeights[1]?.[1] || 0) + 
                                    (filteredSubWeights[2]?.[1] || 0) + 
                                    (filteredSubWeights[3]?.[1] || 0) + 
                                    5 * (filteredSubWeights[0]?.[1] || 0);
      
      const currentTotalWeight = currentMainStatWeight + currentSubStatsWeight;
      
      if (currentTotalWeight > maxTotalWeight) {
        maxTotalWeight = currentTotalWeight;
        mainPropertyMax = currentMainStatWeight;
        subPropertyMax = currentSubStatsWeight;
        bestMainStat = mainStat;
        bestMainWeight = mainWeight;
        bestSubWeights = filteredSubWeights;
      }
    }
    
    // 构建公式字符串
    if (bestMainWeight > 0) {
      const subStatNames = [
        `${bestSubWeights[0]?.[0] || ''}(权重${bestSubWeights[0]?.[1] || 0})`,
        `${bestSubWeights[1]?.[0] || ''}(权重${bestSubWeights[1]?.[1] || 0})`,
        `${bestSubWeights[2]?.[0] || ''}(权重${bestSubWeights[2]?.[1] || 0})`,
        `${bestSubWeights[3]?.[0] || ''}(权重${bestSubWeights[3]?.[1] || 0})`
      ].filter(s => s.trim() !== '');
      
      maxWeightFormula = `主属性-${bestMainStat}（权重${bestMainWeight}）*3+副属性-${subStatNames.join('+')}+5*${bestSubWeights[0]?.[0] || ''}(权重${bestSubWeights[0]?.[1] || 0})`;
    } else {
      const subStatNames = [
        `${availableSubWeights[0]?.[0] || ''}(权重${availableSubWeights[0]?.[1] || 0})`,
        `${availableSubWeights[1]?.[0] || ''}(权重${availableSubWeights[1]?.[1] || 0})`,
        `${availableSubWeights[2]?.[0] || ''}(权重${availableSubWeights[2]?.[1] || 0})`,
        `${availableSubWeights[3]?.[0] || ''}(权重${availableSubWeights[3]?.[1] || 0})`
      ].filter(s => s.trim() !== '');
      
      maxWeightFormula = `副属性-${subStatNames.join('+')}+5*${availableSubWeights[0]?.[0] || ''}(权重${availableSubWeights[0]?.[1] || 0})`;
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
    maxWeightFormula,
    validProperties: validProps,
    qualityWeight,
    levelWeight
  };
}

// 4. 计算角色全套驱动盘评分
function calculateCharacterTotalScore(
  characterData: CharacterData
): CharacterScoreResult {
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
): AllCharactersScoreResult[] {
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

// 重新导出类型
export type {
 SubProperty,
 MainProperty,
 DriveDisc,
 CharacterData,
 DriveDiscScoreResult,
 CharacterScoreResult,
 AllCharactersScoreResult
} from './types.ts';

export type {
 RoleConfig
};



