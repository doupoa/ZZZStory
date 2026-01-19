# 驱动盘评级工具 - 算法与操作细节总结

## 一、核心算法概述

该工具采用**权重评分系统**，通过计算驱动盘实际权重与理论最大权重的比例来评定装备质量。

### 1.1 评分公式

```
最终评分 = (实际总权重 / 理论最大权重) × 100
```

## 二、理论最大权重计算算法

### 2.1 算法核心逻辑

**计算原则**：在所有可能的配置组合中，找到能获得最大权值的方案。

### 2.2 分部位计算

#### **固定主词条部位（I、II、III号位）**

- **特点**：主词条为数值属性（生命值、攻击力、防御力），不在副词条池中
- **主词条权重**：不计入总权重（固定为0）
- **副词条数量**：最多4个
- **计算步骤**：
  1. 从角色副词条配置中筛选权重 > 0 的词条
  2. 按权重从高到低排序
  3. 取前4个副词条
  4. 计算公式：
     ```
     部位最大权重 = 前4个副词条权重之和 + 最强副词条权重 × 5次强化
     ```

#### **自由主词条部位（IV、V、VI号位）**

- **特点**：主词条为百分比属性，与副词条互斥
- **副词条数量**：最多3个（因主副词条互斥）
- **计算步骤**：
  1. 遍历该部位所有可选主词条
  2. 对每个主词条：
     - 计算主词条权重：`w × 3.0`（相当于3个副词条的价值）
     - 排除主词条后，选择权重最高的3个副词条
     - 副词条权重 = 3个副词条初始权重 + 最强副词条 × 5次强化
  3. 取所有主词条配置方案中的最大值

**代码示例**：

```javascript
// 自由部位最大权重计算
availableMainStats.forEach((mainStatName) => {
  // 获取主词条权重
  let mainStatWeight = char.mainStats[slot][mainStatName] || 0;

  if (mainStatWeight > 0) {
    const mainWeight = mainStatWeight * 3.0; // 主词条 = 3副词条

    // 排除主词条，选择前3个副词条
    const top3SubStats = availableSubStats.slice(0, 3);

    // 计算副词条权重
    const initialSubWeight = top3SubStats.reduce((sum, w) => sum + w, 0);
    const maxSubEnhancement = top3SubStats[0] * 5;

    const currentSlotWeight = mainWeight + initialSubWeight + maxSubEnhancement;
    slotMaxWeight = Math.max(slotMaxWeight, currentSlotWeight);
  }
});
```

### 2.3 品质倍率

不同品质的驱动盘会影响实际权重：

- **S级**：倍率 1.0（满分）
- **A级**：倍率 0.67
- **B级**：倍率 0.33

```
实际总权重 = Σ (各部位实际权重 × 品质倍率)
```

## 三、实际权重计算算法

### 3.1 主词条权重计算

**仅计算 IV、V、VI 号位（自由部位）**

```javascript
if (["IV", "V", "VI"].includes(slot) && data.mainStat) {
  let w = 0;

  if (data.mainStat === "属性伤害%") {
    // 需要元素匹配
    if (data.element === char.element) {
      w = char.mainStats.V["属性伤害%"] || 1.0;
    }
  } else {
    w = char.mainStats[slot][data.mainStat] || 0;
  }

  if (w > 0) {
    validMainCount++; // 记录有效主词条数量
    actualWeight += w * 3.0; // 主词条权重 × 3
  }
}
```

**关键点**：

- 属性伤害%需要元素匹配才有效
- 有效主词条会计入 `validMainCount` 统计

### 3.2 副词条权重计算

```javascript
data.subStats.forEach((sub) => {
  if (sub.name) {
    const isHighlight = char.highlightSubStats.includes(sub.name);

    if (isHighlight) {
      // 高亮词条：计入有效副词条和分数
      const w = char.subStats[sub.name] || 0;
      const totalHits = 1 + sub.upgrades; // 1个初始 + sub.upgrades次强化
      validSubTotalHits += totalHits;
      actualWeight += w * totalHits;
    } else {
      // 非高亮词条：不计入分数，但计入无效副词条统计
      const totalHits = 1 + sub.upgrades;
      invalidSubUpgrades += totalHits;
    }
  }
});
```

**关键点**：

- 只有角色配置中 `highlightSubStats` 列出的副词条才计入有效权重
- 权重 = 副词条权重 × (1 + 强化次数)
- 非高亮词条不影响评分，但会被标记为无效

## 四、等级与强化系统

### 4.1 强化次数限制

根据驱动盘等级确定最大强化次数：

| 等级范围 | 最大强化次数 |
| -------- | ------------ |
| 0-2      | 1次          |
| 3-5      | 2次          |
| 6-8      | 3次          |
| 9-11     | 4次          |
| 12-15    | 5次          |

```javascript
const getMaxUpgradesForLevel = (level) => {
  if (level >= 12) return 5;
  if (level >= 9) return 4;
  if (level >= 6) return 3;
  if (level >= 3) return 2;
  return 1;
};
```

### 4.2 初始副词条数量

```javascript
const getInitialSubSlots = (level, remainingUpgrades) => {
  const maxUpgrades = getMaxUpgradesForLevel(level);

  if (maxUpgrades >= 5) {
    if (remainingUpgrades <= 0) return 4; // 满强化：4个初始副词条
    if (remainingUpgrades >= 1) return 3; // 未满强化：3个初始副词条
  }
  return 3; // 默认3个
};
```

**规则**：

- 等级12+且已满强化：4个初始副词条
- 等级12+但未满强化：3个初始副词条
- 其他情况：3个初始副词条

## 五、评级系统

### 5.1 评分区间与评级

| 评分范围 | 评级 | 描述              | 样式颜色        |
| -------- | ---- | ----------------- | --------------- |
| ≥97      | SSS+ | 极限毕业 (神话盘) | 青色(#00eeff)   |
| ≥93      | SSS  | 完美毕业 (神盘)   | 红色(#ff4444)   |
| ≥90      | SS   | 大毕业 (极品)     | 橙色(#ff8c00)   |
| ≥80      | S    | 毕业 (好用)       | 金色(#ffd700)   |
| ≥70      | A    | 毕业 (标准)       | 银色(#c0c0c0)   |
| ≥60      | B    | 可用 (过渡)       | 铜色(#cd7f32)   |
| ≥50      | C    | 胚子 (需强化)     | 灰色(#a0a0a0)   |
| ≥40      | D    | 较差              | 深灰(#808080)   |
| ≥30      | E    | 废弃              | 更深灰(#606060) |
| 0        | ?    | 未填写词条        | 暗灰(#404040)   |

### 5.2 结果面板显示

评分结果包含以下统计信息：

1. **总分**：精确到小数点后1位
2. **评级**：根据评分区间判定
3. **评级描述**：对应的质量说明
4. **有效主词条**：显示/3（3个自由部位的有效主词条数量）
5. **有效副词条**：初始副词条+强化次数的总和
6. **无效副词条提升**：非高亮副词条的初始+强化次数
7. **词条贡献明细**：按权重降序显示各有效副词条的贡献百分比

## 六、操作细节

### 6.1 角色选择

- 从下拉菜单选择角色
- 显示角色属性（如"冰"）
- 显示高亮副词条列表（如"暴击率%、暴击伤害%、攻击力%、穿透值"）

### 6.2 驱动盘配置

每个驱动盘需要配置：

1. **品质**：S/A/B级，影响权重倍率
2. **等级**：0-15级，决定最大强化次数
3. **主词条**：
   - I、II、III号位：固定（生命值、攻击力、防御力）
   - IV、V、VI号位：自由选择
   - 主词条为"属性伤害%"时需额外选择元素类型
4. **副词条**：
   - 最多4个（固定部位）或3个（自由部位）
   - 每个副词条可强化0-5次
   - 必须唯一，不能重复
   - 不能与主词条相同

### 6.3 副词条唯一性规则

```javascript
const availableOptions = computed(() => {
  return SUB_STATS_POOL.filter((statName) => {
    // 1. 唯一性检查
    if (props.selectedSubStats.includes(statName)) {
      const isMe = props.stat.name === statName;
      if (!isMe) return false; // 已被其他副词条使用
    }
    // 2. 主副互斥检查
    if (statName === props.bannedSubStat) return false;
    return true;
  });
});
```

### 6.4 强化限制

- 单个副词条最多强化5次
- 总强化次数不能超过等级限制
- 必须先选择副词条才能进行强化

```javascript
const canIncrease = computed(() => {
  return props.stat.upgrades < 5 && props.remainingUpgrades > 0;
});
```

## 七、配置文件说明

### 7.1 character-weights.json 结构

```json
{
  "CHARACTER_CONFIGS": {
    "角色名": {
      "element": "元素类型",
      "mainStats": {
        "IV": {"暴击率%": 1.0, "暴击伤害%": 1.0},
        "V": {"属性伤害%": 1.0, "穿透率%": 1.0},
        "VI": {"攻击力%": 1.0}
      },
      "subStats": {
        "暴击率%": 1.0,
        "暴击伤害%": 1.0,
        "攻击力%": 0.8,
        ...
      },
      "highlightSubStats": ["暴击率%", "暴击伤害%", "攻击力%", "穿透值"]
    }
  },
  "SLOT_MAIN_POOLS": {
    "I": ["生命值"],
    "II": ["攻击力"],
    "III": ["防御力"],
    "IV": ["攻击力%", "生命值%", "防御力%", "暴击率%", "暴击伤害%", "异常精通"],
    "V": ["攻击力%", "生命值%", "防御力%", "穿透率%", "属性伤害%"],
    "VI": ["攻击力%", "生命值%", "防御力%", "异常掌控%", "冲击力%", "能量自动回复"]
  },
  "SUB_STATS_POOL": ["生命值", "生命值%", "攻击力", "攻击力%", ...],
  "ELEMENTS": ["物理", "火", "冰", "电", "以太"],
  "QUALITY_MULTIPLIERS": {
    "S": 1.0,
    "A": 0.67,
    "B": 0.33
  }
}
```

### 7.2 配置说明

- **CHARACTER_CONFIGS**：角色专属配置
  - `element`：角色元素属性
  - `mainStats`：各部位主词条权重
  - `subStats`：副词条权重（0表示不计入评分）
  - `highlightSubStats`：高亮副词条列表（只有这些才计入评分）

- **SLOT_MAIN_POOLS**：各部位可选主词条池

- **SUB_STATS_POOL**：所有可用的副词条类型

- **ELEMENTS**：所有元素类型

- **QUALITY_MULTIPLIERS**：品质倍率配置

## 八、特殊机制

### 8.1 主词条价值系数

- **主词条权重 = 副词条权重 × 3.0**
- 这意味着一个有效的主词条相当于3个同权重的副词条

### 8.2 属性伤害%特殊处理

- 只有在主词条为"属性伤害%"时才需要选择元素
- 只有元素与角色属性匹配时才计入有效权重
- 配置存储在 `mainStats.V` 中

### 8.3 高亮 vs 非高亮副词条

- **高亮副词条**：计入评分权重，计入"有效副词条"统计
- **非高亮副词条**：权重为0，不计入评分，但计入"无效副词条"统计

这个设计允许识别出有潜力的胚子（副词条质量高但不是最优），同时不会影响最终评分。

## 九、使用流程

1. **选择角色**：从下拉菜单选择要评分的角色
2. **配置驱动盘**：
   - 为6个部位分别设置品质和等级
   - 选择主词条（自由部位）
   - 选择副词条并设置强化次数
3. **计算评分**：点击"计算评分"按钮
4. **查看结果**：
   - 查看总分和评级
   - 分析有效/无效副词条统计
   - 查看各词条贡献明细
5. **调整优化**：根据结果调整配置，重新计算
6. **重置**：点击"重置所有"清空配置重新开始

## 十、注意事项

1. **完整填写**：至少需要填写主词条或副词条才能计算评分
2. **主副互斥**：副词条不能与主词条相同（自由部位）
3. **唯一性**：同一驱动盘的副词条不能重复
4. **强化上限**：单个副词条最多强化5次，总次数受等级限制
5. **品质影响**：A级驱动盘的评分最高只能达到S级的67%
6. **理论满分**：界面上显示的"理论满分权重"是根据当前角色动态计算的

## 十一、算法优势

1. **客观量化**：通过权重系统将复杂的属性价值数字化
2. **角色适配**：不同角色有不同的最优配置，评分结果更具针对性
3. **潜力识别**：通过有效/无效副词条统计，帮助识别有强化潜力的胚子
4. **操作简便**：界面直观，支持实时预览和调整
5. **可视化反馈**：清晰的评分和评级系统，便于理解装备质量

---

_本文档总结了驱动盘评级工具的核心算法和操作细节，适用于绝区零(ZZZ)游戏的装备评分系统。_
