// 手动录入标签页方法库
import { characterWeights } from "./rating_algorithm.ts";
import { SLOT_MAIN_POOLS } from "./rating_algorithm.ts";
import { SUB_STATS_POOL } from "./rating_algorithm.ts";

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
    IV: {},
    V: {},
    VI: {},
  };

  // 获取角色权重配置
  const charWeights = characterWeights[characterName] || {};

  // 处理 4 号位
  const slot4Pools = SLOT_MAIN_POOLS[4] || [];
  slot4Pools.forEach((stat) => {
    // 检查权重是否大于 0
    if (charWeights[stat] > 0) {
      result["IV"][stat] = charWeights[stat];
    }
  });

  // 处理 5 号位
  const slot5Pools = SLOT_MAIN_POOLS[5] || [];
  slot5Pools.forEach((stat) => {
    if (stat === "属性伤害") {
      // 处理属性伤害，查找角色对应的属性伤害加成
      for (const [key, value] of Object.entries(charWeights)) {
        if (key.includes("属性伤害加成") && value > 0) {
          result["V"][key] = value;
        }
      }
    } else {
      // 处理其他属性
      if (charWeights[stat] > 0) {
        result["V"][stat] = charWeights[stat];
      }
    }
  });

  // 处理 6 号位
  const slot6Pools = SLOT_MAIN_POOLS[6] || [];
  slot6Pools.forEach((stat) => {
    if (charWeights[stat] > 0) {
      result["VI"][stat] = charWeights[stat];
    }
  });

  return result;
}

// 获取角色副词条权重配置
export function getCharacterSubStatsWeights(
  characterName: string,
): StatWeights {
  // 初始化返回对象
  const result: StatWeights = {};

  // 获取角色权重配置
  const charWeights = characterWeights[characterName] || {};

  // 遍历副词条池，只保留权重 > 0 的词条
  SUB_STATS_POOL.forEach((stat) => {
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
  SUB_STATS_POOL.forEach((stat) => {
    if (charWeights[stat] > 0) {
      result.push(stat);
    }
  });

  return result;
}
