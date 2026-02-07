// 驱动盘评分算法实现

//---导入类型定义---

import type {
  SubProperty,
  MainProperty,
  DriveDisc,
  CharacterData,
  DriveDiscScoreResult,
  CharacterScoreResult,
  AllCharactersScoreResult,
  GradeResult,
  CharacterWeightConfig,
  ValidPropertyDetail,
  MaxWeightInfo
} from './types.ts';
// 从 JSON 文件导入角色权重配置
import characterWeightsData from './character_weight.json';

//---配置---

// 配置品质权重
export const QUALITY_WEIGHTS: Record<string, number> = {
  'S': 1,
  'A': 0.67,
  'B': 0.33
};
//配置每个部位的主词条可选池
export const SLOT_MAIN_POOLS: Record<number, string[]> = {
  1: ['生命值'],           // 1号位固定主词条
  2: ['攻击力'],          // 2号位固定主词条
  3: ['防御力'],         // 3号位固定主词条
  4: ['攻击力', '生命值', '防御力', '暴击率', '暴击伤害', '异常精通'],  // 4号位可选主词条
  5: ['攻击力', '生命值', '防御力', '穿透率', '属性伤害'],  // 5号位可选主词条
  6: ['攻击力', '生命值', '防御力', '异常掌控', '冲击力', '能量自动回复'],  // 6号位可选主词条
};
//配置每个部位的副词条可选池
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
//配置所有角色权重配置
export const characterWeights: CharacterWeightConfig = characterWeightsData;

//---工具函数---

/**
 * 计算驱动盘评分等级
 * @param finalScore - 最终评分
 * @returns 等级结果对象，包含等级、等级类名和等级描述
 */
export function calculateGrade(finalScore: number): GradeResult {
  let grade = "F";
  let gradeClass = "grade-f";
  let gradeDesc = "可以掰了(是不是没升级？)";

  if (finalScore >= 97) {
    grade = "SSS+";
    gradeClass = "grade-sssp";
    gradeDesc = "极限毕业 (神话盘)";
  } else if (finalScore >= 93) {
    grade = "SSS";
    gradeClass = "grade-sss";
    gradeDesc = "完美毕业 (神盘)";
  } else if (finalScore >= 90) {
    grade = "SS";
    gradeClass = "grade-ss";
    gradeDesc = "大毕业 (极品)";
  } else if (finalScore >= 80) {
    grade = "S";
    gradeClass = "grade-s";
    gradeDesc = "毕业 (好用)";
  } else if (finalScore >= 70) {
    grade = "A";
    gradeClass = "grade-a";
    gradeDesc = "毕业 (标准)";
  } else if (finalScore >= 60) {
    grade = "B";
    gradeClass = "grade-b";
    gradeDesc = "可用 (过渡)";
  } else if (finalScore >= 50) {
    grade = "C";
    gradeClass = "grade-c";
    gradeDesc = "胚子 (需强化)";
  } else if (finalScore >= 40) {
    grade = "D";
    gradeClass = "grade-d";
    gradeDesc = "较差";
  } else if (finalScore >= 30) {
    grade = "E";
    gradeClass = "grade-e";
    gradeDesc = "废弃";
  } else if (finalScore == 0) {
    grade = "?";
    gradeClass = "grade-f";
    gradeDesc = "一个词条都没填评什么？快去填属性！";
  }

  return { grade, gradeClass, gradeDesc };
}

/**
 * 计算驱动盘部位的最高权重信息
 * @param position - 驱动盘位置（1-6）
 * @param weightConfig - 角色权重配置
 * @returns 最高权重信息对象
 */
function calculateMaxWeightInfo(
  position: number,
  weightConfig: { [propertyName: string]: number }
): MaxWeightInfo {
  const availableSubWeights = SUB_STATS_POOL
    .filter((stat) => weightConfig[stat] > 0)
    .map((stat) => [stat, weightConfig[stat]] as [string, number])
    .sort((a, b) => b[1] - a[1]);
  
  let subPropertyMax = 0;
  let mainPropertyMax = 0;
  let maxWeightFormula = '';
  
  if (position >= 1 && position <= 3) {
    mainPropertyMax = 0;
    subPropertyMax = (availableSubWeights[0]?.[1] || 0) + 
                     (availableSubWeights[1]?.[1] || 0) + 
                     (availableSubWeights[2]?.[1] || 0) + 
                     (availableSubWeights[3]?.[1] || 0) + 
                     5 * (availableSubWeights[0]?.[1] || 0);
    
    const subStatNames = [
      `${availableSubWeights[0]?.[0] || ''}(权重${availableSubWeights[0]?.[1] || 0})`,
      `${availableSubWeights[1]?.[0] || ''}(权重${availableSubWeights[1]?.[1] || 0})`,
      `${availableSubWeights[2]?.[0] || ''}(权重${availableSubWeights[2]?.[1] || 0})`,
      `${availableSubWeights[3]?.[0] || ''}(权重${availableSubWeights[3]?.[1] || 0})`
    ].filter(s => s.trim() !== '');
    
    maxWeightFormula = `副属性-${subStatNames.join('+')}+5*${availableSubWeights[0]?.[0] || ''}(权重${availableSubWeights[0]?.[1] || 0})`;
  }
  
  if (position >= 4 && position <= 6) {
    let maxTotalWeight = 0;
    let bestMainStat = '';
    let bestMainWeight = 0;
    let bestSubWeights: [string, number][] = [];
    
    const slotKey = position as keyof typeof SLOT_MAIN_POOLS;
    const allMainStats = SLOT_MAIN_POOLS[slotKey] || [];
    
    for (const mainStat of allMainStats) {
      const mainWeight = weightConfig[mainStat] || 0;
      const currentMainStatWeight = 3 * mainWeight;
      
      const filteredSubWeights = availableSubWeights.filter(([stat]) => stat !== mainStat);
      
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
  
  return {
    subPropertyMax,
    mainPropertyMax,
    maxWeightSum: subPropertyMax + mainPropertyMax,
    maxWeightFormula
  };
}

/**
 * 获取属性名称（区分大属性和小属性）
 * @param prop - 副词条对象
 * @returns 属性名称，如果是小属性则返回对应的"小XX"格式
 * 
 * 说明：
 * - 如果属性值不包含%，且是生命值/攻击力/防御力，则视为小属性
 * - 小属性名称格式：小攻击、小生命、小防御
 */
function getPropertyName(prop: SubProperty): string {
  let propertyName = prop.name;
  
  if (!prop.value.includes('%') && ['生命值', '攻击力', '防御力'].includes(prop.name)) {
    if (prop.name === '攻击力') {
      propertyName = '小攻击';
    } else if (prop.name === '生命值') {
      propertyName = '小生命';
    } else if (prop.name === '防御力') {
      propertyName = '小防御';
    }
  }
  
  return propertyName;
}

/**
 * 获取指定角色的权重配置
 * @param characterName - 角色名称
 * @returns 角色权重配置对象，包含各词条的权重值
 * 
 * 匹配规则：
 * 1. 优先精确匹配角色名称
 * 2. 如果精确匹配失败，尝试模糊匹配（包含关系）
 * 3. 如果仍未匹配，返回默认配置（叶瞬光）
 */
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

/**
 * 获取所有已配置的角色名称列表
 * @returns 已配置的角色名称数组
 * 
 * 说明：
 * - 从 characterWeights 配置中提取所有角色名称
 * - 可用于前端展示角色选择列表
 */
export function getConfiguredCharacters(): string[] {
  return Object.keys(characterWeights);
}

/**
 * 计算单个驱动盘的评分
 * @param driveDisc - 要计算评分的驱动盘对象
 * @param roleName - 角色名称，默认值为 'default'
 * @returns 驱动盘评分结果对象，包含评分、副词条权重、主词条权重、最大权重总和、最大权重公式、有效词条列表、品质权重、等级权重
 * 
 * 说明：
 * - 该函数根据驱动盘的品质、等级、主词条、副词条以及指定角色的权重配置计算评分
 * - 若驱动盘或角色配置不存在，返回默认值（0分）
 */
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
      maxWeightInfo: {
        subPropertyMax: 0,
        mainPropertyMax: 0,
        maxWeightSum: 0,
        maxWeightFormula: ''
      },
      validProperties: [],
      qualityWeight: 0,
      levelWeight: 0
    };
  }
  
  const weightConfig = getCharacterWeights(roleName);
  
  // 步骤1：计算品质权重
  const rarity = driveDisc.rarity || 'S';
  const qualityWeight = QUALITY_WEIGHTS[rarity] || 1;
  
  // 步骤2：计算实际有效副词条权重总和
  //将单个驱动盘的所有副词条集中到一个数组subProperties中
  const subProperties = Array.isArray(driveDisc.subProperties) ? driveDisc.subProperties : [];
  
  let subPropertiesWeight = 0;//初始化实际有效副词条权重总和
  const validProps: ValidPropertyDetail[] = [];//初始化有效副词条详情数组
  //遍历所有副词条，输出subProperties和validProps
  subProperties.forEach(prop => {
    const propertyName = getPropertyName(prop);
    const weight = weightConfig[propertyName] || 0;
    
    if (weight > 0) {
      const addValue = prop.add || 0;
      const weightedValue = weight + addValue * weight;
      subPropertiesWeight += weightedValue;
      
      validProps.push({
        name: prop.name,
        value: prop.value,
        weight: weight,
        add: addValue,
        weightedValue: weightedValue
      });
      
      console.log(`位置${driveDisc.position} - 副词条: ${prop.name}(${prop.value}) -> 匹配: ${propertyName}, 权重: ${weight}, add: ${addValue}, 加权值: ${weightedValue}`);
    }
  });
  
  // 步骤3：处理4~6号位主词条实际等值权重
  // 确保position是有效的数字
  const position = typeof driveDisc.position === 'number' ? driveDisc.position : 1;
  
  // 确保mainProperty是有效的对象
  const mainProperty = driveDisc.mainProperty || { name: '', value: '' };

  // 获取主词条等级权重（0级0.25，每升1级+0.05，15级达1）
  const level = driveDisc.level || 0;
  const levelWeight = Math.min(0.25 + level * 0.05, 1);
  
  let mainPropertyWeight = 0;
  if (position >= 4 && position <= 6) {
    // 4~6号位主词条等值3条副词条，权重为3 × 主属性权重 × 等级权重
    const mainPropWeight = weightConfig[mainProperty.name] || 0;
    mainPropertyWeight = 3 * mainPropWeight * levelWeight;
  }
  
  // 步骤4：计算该部位的最高词条数总和
  const maxWeightInfo = calculateMaxWeightInfo(position, weightConfig);
  
  // 输出调试信息
  console.log(`位置${position} - 副词条最大: ${maxWeightInfo.subPropertyMax.toFixed(4)}, 主属性最大: ${maxWeightInfo.mainPropertyMax.toFixed(4)}, 总和: ${maxWeightInfo.maxWeightSum.toFixed(4)}`);
  
  // 步骤5：计算每1权重有效词条分值
  const scorePerWeight = 55 / maxWeightInfo.maxWeightSum;
  
  // 输出调试信息
  console.log(`位置${position} - 每权重分值: ${scorePerWeight.toFixed(4)}`);
  
  // 步骤6：计算实际分值和等级结果
  const actualScore = (subPropertiesWeight + mainPropertyWeight) * scorePerWeight * qualityWeight;
  
  // 计算等级结果
  const gradeResult = calculateGrade(actualScore);
  
  // 输出调试信息
  console.log(`位置${position} - 实际得分: ${actualScore.toFixed(4)},等级结果:${gradeResult.grade} (副词条权重: ${subPropertiesWeight.toFixed(4)} + 主属性权重: ${mainPropertyWeight.toFixed(4)}) × 每权重分值: ${scorePerWeight.toFixed(4)} × 品质权重: ${qualityWeight.toFixed(4)}`);
  
  return {
    score: Math.round(actualScore * 10) / 10, // 保留一位小数
    subPropertiesWeight,
    mainPropertyWeight,
    maxWeightInfo,
    validProperties: validProps,
    qualityWeight,
    levelWeight,
    gradeResult
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
    const { totalScore, discScores, discDetails } = calculateCharacterTotalScore(character);
    return {
      characterName: character.characterFullName,
      totalScore,
      discScores,
      discDetails
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



