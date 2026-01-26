// 角色驱动盘词条权重配置
// 数值表示该词条的权重占比，1为最高权重，0为无效词条

export interface CharacterWeightConfig {
  [characterName: string]: {
    [propertyName: string]: number;
  };
}

// 角色权重配置
export const characterWeights: CharacterWeightConfig = {
  // 叶瞬光 - 输出型角色
  '叶瞬光': {
    '生命值': 0,
    '攻击力': 1,
    '防御力': 0,
    '冲击力': 0,
    '暴击率': 1,
    '暴击伤害': 1,
    '物理伤害加成': 1,
    '异常掌控': 0,
    '异常精通': 0,
    '穿透值': 0.3,
    '穿透率': 1,
    '能量自动回复': 0,
    // 小属性（大属性的1/3）
    '小攻击': 0.33,
    '小生命': 0,
    '小防御': 0
  },
  // 照 - 防护型角色（profession: 5）
  '照': {
    '生命值': 1,
    '攻击力': 0,
    '防御力': 0,
    '冲击力': 0,
    '暴击率': 0.5,
    '暴击伤害': 0.5,
    '物理伤害加成': 0,
    '异常掌控': 0,
    '异常精通': 0,
    '穿透值': 0,
    '穿透率': 0,
    '能量自动回复': 1,
    // 小属性（大属性的1/3）
    '小攻击': 0,
    '小生命': 0.33,
    '小防御': 0
  },
  // 悠真 - 输出型角色（电属性）
  '悠真': {
    '生命值': 0,
    '攻击力': 1,
    '防御力': 0,
    '冲击力': 0,
    '暴击率': 1,
    '暴击伤害': 1,
    '电属性伤害加成': 1,
    '物理伤害加成': 1,
    '异常掌控': 0,
    '异常精通': 0,
    '穿透值': 0.3,
    '穿透率': 1,
    '能量自动回复': 0,
    // 小属性（大属性的1/3）
    '小攻击': 0.33,
    '小生命': 0,
    '小防御': 0
  },
  // 妮可 - 异常型角色（以太属性）
  '妮可': {
    '生命值': 0,
    '攻击力': 1,
    '防御力': 0,
    '冲击力': 0,
    '暴击率': 0,
    '暴击伤害': 0,
    '以太伤害加成': 1,
    '异常掌控': 1,
    '异常精通': 1,
    '穿透值': 0.2,
    '穿透率': 0.5,
    '能量自动回复': 1,
    // 小属性（大属性的1/3）
    '小攻击': 0.33,
    '小生命': 0,
    '小防御': 0
  },
};

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
