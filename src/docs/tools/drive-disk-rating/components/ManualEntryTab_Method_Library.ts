// 手动录入标签页方法库
import { characterWeights } from './rating_algorithm.ts';
import { SLOT_MAIN_POOLS } from './rating_algorithm.ts';
import { SUB_STATS_POOL } from './rating_algorithm.ts';

// 从 JSON 文件导入角色元素映射配置
import characterElementMapping from './Character_Stat_Damage_Mapping_Table.json';

// 定义类型
interface StatWeights {
  [stat: string]: number;
}

// 获取角色主词条权重配置
export function getCharacterMainStatsWeights(characterName: string): {
  [slot: string]: StatWeights;
} {
  // 初始化返回对象（使用罗马数字）
  const result: { [slot: string]: StatWeights } = {
    'IV': {},
    'V': {},
    'VI': {}
  };
  
  // 获取角色权重配置
  const charWeights = characterWeights[characterName] || {};
  
  // 处理 4 号位
  const slot4Pools = SLOT_MAIN_POOLS[4] || [];
  slot4Pools.forEach(stat => {
    // 检查权重是否大于 0
    if (charWeights[stat] > 0) {
      result['IV'][stat] = charWeights[stat];
    }
  });
  
  // 处理 5 号位
  const slot5Pools = SLOT_MAIN_POOLS[5] || [];
  slot5Pools.forEach(stat => {
    if (stat === '属性伤害') {
      // 处理属性伤害，查找角色对应的属性伤害加成
      for (const [key, value] of Object.entries(charWeights)) {
        if (key.includes('属性伤害加成') && value > 0) {
          result['V'][key] = value;
        }
      }
    } else {
      // 处理其他属性
      if (charWeights[stat] > 0) {
        result['V'][stat] = charWeights[stat];
      }
    }
  });
  
  // 处理 6 号位
  const slot6Pools = SLOT_MAIN_POOLS[6] || [];
  slot6Pools.forEach(stat => {
    if (charWeights[stat] > 0) {
      result['VI'][stat] = charWeights[stat];
    }
  });
  
  return result;
}

// 获取角色副词条权重配置
export function getCharacterSubStatsWeights(characterName: string): StatWeights {
  // 初始化返回对象
  const result: StatWeights = {};
  
  // 获取角色权重配置
  const charWeights = characterWeights[characterName] || {};
  
  // 遍历副词条池，只保留权重 > 0 的词条
  SUB_STATS_POOL.forEach(stat => {
    if (charWeights[stat] > 0) {
      result[stat] = charWeights[stat];
    }
  });
  
  return result;
}

// 获取角色高亮副词条列表
export function getCharacterHighlightSubStats(characterName: string): string[] {
  // 初始化返回列表
  const result: string[] = [];
  
  // 获取角色权重配置
  const charWeights = characterWeights[characterName] || {};
  
  // 遍历副词条池，只保留权重 > 0 的词条名称
  SUB_STATS_POOL.forEach(stat => {
    if (charWeights[stat] > 0) {
      result.push(stat);
    }
  });
  
  return result;
}

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

// 导出元素类型列表
export const ELEMENTS = characterElementMapping.ELEMENTS || [];

// 定义角色配置类型
export interface CharacterConfig {
  element: string;
  mainStats: {
    [slot: string]: { [stat: string]: number };
  };
  subStats: { [stat: string]: number };
  highlightSubStats: string[];
}

// 定义角色配置类型
export interface CharacterConfigs {
  [key: string]: CharacterConfig;
}

// 构建角色配置对象
export function buildCharacterConfigs(): CharacterConfigs {
  const configs: CharacterConfigs = {};
  const characterNames = Object.keys(characterWeights);
  
  characterNames.forEach(characterName => {
    configs[characterName] = {
      element: getCharacterElement(characterName),
      mainStats: getCharacterMainStatsWeights(characterName),
      subStats: getCharacterSubStatsWeights(characterName),
      highlightSubStats: getCharacterHighlightSubStats(characterName)
    };
  });
  
  return configs;
}

// 获取指定部位的主词条选项
export function getMainStatOptions(slotId: string): string[] {
  // 将罗马数字 slotId 转换为数字
  const slotNumberMap: Record<string, number> = {
    "I": 1,
    "II": 2,
    "III": 3,
    "IV": 4,
    "V": 5,
    "VI": 6
  };
  const slotNumber = slotNumberMap[slotId] || 1;
  return SLOT_MAIN_POOLS[slotNumber] || [];
}

