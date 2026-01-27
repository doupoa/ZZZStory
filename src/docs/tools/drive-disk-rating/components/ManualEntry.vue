<template>
  <div class="manual-entry">
    <!-- 角色选择 -->
    <CharacterSelector
      v-model="currentCharacterName"
      @change="handleCharacterChange"
    />

    <!-- 驱动盘配置区 -->
    <div class="rounded-lg">
      <div class="text-lg font-semibold my-2 text-black dark:text-gray-200">
        驱动盘配置 (理论满分权重{{ maxPossibleWeight.toFixed(1) }})
      </div>

      <!-- 驱动盘网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DriveCard
          v-for="slotId in slots"
          :key="slotId"
          :slot-id="slotId"
          :data="driveData[slotId]"
          :character="currentCharacter"
          @update:basic="handleUpdateBasic"
          @update:mainStat="handleUpdateMainStat"
          @update:subStat="handleUpdateSubStat"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-center gap-5 mt-5">
        <button
          @click="calculateScore"
          class="px-8! py-2.5! border-none rounded text-sm font-semibold cursor-pointer bg-(--main-color-1)! hover:bg-(--main-color-2)! text-white! dark:text-black! transition-colors"
        >
          计算评分
        </button>
        <button
          @click="resetAll"
          class="px-8! py-2.5! border-none rounded text-sm font-semibold cursor-pointer hover:bg-gray-200! dark:bg-[#2d2d30] dark:hover:bg-gray-800! dark:text-gray-300 transition-colors"
        >
          重置所有
        </button>
      </div>
    </div>

    <!-- 结果面板 -->
    <div
      class="text-lg font-semibold my-2 text-black dark:text-gray-200"
      v-if="showResult"
    >
      评分结果
    </div>
    <ResultPanel
      :visible="showResult"
      :score-result="scoreResult"
      :max-weight="maxPossibleWeight"
      ref="results"
    />

    <!-- 切换提示 -->
    <div class="switch-hint">
      <button @click="switchToAuto" class="switch-btn">
        🚀 填累了？试试自动提取
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import CharacterSelector from "./CharacterSelector.vue";
import DriveCard from "./DriveCard.vue";
import ResultPanel from "./ResultPanel.vue";
import characterWeights from "../character-weights.json";

// 定义类型
interface CharacterConfig {
  element: string;
  mainStats: {
    [slot: string]: { [stat: string]: number };
  };
  subStats: { [stat: string]: number };
  highlightSubStats: string[];
}

// 从 JSON 中提取配置
const { SLOT_MAIN_POOLS, QUALITY_MULTIPLIERS, CHARACTER_CONFIGS } =
  characterWeights as any;

// 工具函数
const getMaxUpgradesForLevel = (level: number) => {
  if (level >= 12) return 5;
  if (level >= 9) return 4;
  if (level >= 6) return 3;
  if (level >= 3) return 2;
  return 1;
};

const getInitialSubSlots = (level: number, remainingUpgrades: number) => {
  const maxUpgrades = getMaxUpgradesForLevel(level);
  if (maxUpgrades >= 5) {
    if (remainingUpgrades <= 0) {
      return 4;
    } else if (remainingUpgrades >= 1) {
      return 3;
    }
  }
  return 3;
};

const initDriveData = () => {
  const slots = ["I", "II", "III", "IV", "V", "VI"];
  const data: any = {};

  slots.forEach((slot) => {
    data[slot] = {
      quality: "S",
      level: 15,
      mainStat: "",
      element: "",
      subStats: Array(4)
        .fill(null)
        .map(() => ({
          name: "",
          upgrades: 0,
        })),
    };
  });

  data["I"].mainStat = "生命值";
  data["II"].mainStat = "攻击力";
  data["III"].mainStat = "防御力";

  return data;
};

// 角色选择
const currentCharacterName = ref("星见雅");
const currentCharacter = computed(
  () => CHARACTER_CONFIGS[currentCharacterName.value],
);

// 驱动盘数据
const driveData = ref(initDriveData());

// 部位列表
const slots = ["I", "II", "III", "IV", "V", "VI"];

// 结果显示
const showResult = ref(false);
const scoreResult = ref({
  totalScore: 0,
  grade: "-",
  gradeClass: "grade-f",
  gradeDesc: "",
  validMainCount: 0,
  validSubTotalHits: 0,
  invalidSubUpgrades: 0,
  breakdown: {},
});

// 结果面板
const results = ref<HTMLElement | null>(null);

// 定义事件
const emit = defineEmits<{
  (e: "switch-to-auto"): void;
}>();

// 角色切换处理
const handleCharacterChange = (character: CharacterConfig) => {
  showResult.value = false;
};

// 切换到自动模式
const switchToAuto = () => {
  emit("switch-to-auto");
};

// 更新基础信息（品质、等级）
const handleUpdateBasic = (slotId: string, field: string, value: string) => {
  driveData.value[slotId][field] = value;
};

// 更新主词条
const handleUpdateMainStat = (slotId: string, value: string) => {
  driveData.value[slotId].mainStat = value;
  driveData.value[slotId].element = ""; // 重置元素选择
};

// 更新副词条
const handleUpdateSubStat = (
  slotId: string,
  index: number,
  field: string,
  value: number | string,
) => {
  const stat = driveData.value[slotId].subStats[index];
  const currentTotalUpgrades = driveData.value[slotId].subStats.reduce(
    (sum: number, s: any) => sum + s.upgrades,
    0,
  );
  const maxAllowedUpgrades = getMaxUpgradesForLevel(
    driveData.value[slotId].level,
  );

  if (field === "name") {
    stat.name = value as string;
    stat.upgrades = 0;
  } else if (field === "upgrades") {
    if (value > 0) {
      if (stat.upgrades < 5 && currentTotalUpgrades < maxAllowedUpgrades) {
        stat.upgrades += value as number;
      }
    } else {
      if (stat.upgrades > 0) {
        stat.upgrades += value as number;
      }
    }
  }
};

// 动态计算最大权重（总分）
const maxPossibleWeight = computed(() => {
  const char = currentCharacter.value;
  let totalMaxWeight = 0;

  slots.forEach((slot) => {
    const fixedSlots = ["I", "II", "III"];
    const isFixedSlot = fixedSlots.includes(slot);

    if (isFixedSlot) {
      // 1-3号位（固定部位）：主词条是数值属性，不在副词条池中
      // 主词条不计入权重
      // 最高分 = 4个副词条（初始） + 5次提升全部给权重最高的副词条
      const subStatsAvailable: [string, number][] = (
        Object.entries(char.subStats) as [string, number][]
      )
        .filter(([, weight]) => weight > 0)
        .sort((a, b) => b[1] - a[1]);

      // 选择权重最高的4个副词条
      const top4SubStats = subStatsAvailable.slice(0, 4);

      // 计算权重：4个副词条的初始值 + 5次提升全部给权重最高的
      const initialWeight = top4SubStats.reduce(
        (sum: number, [, weight]: [string, number]) => sum + weight,
        0,
      );
      const maxEnhancement =
        top4SubStats.length > 0 ? top4SubStats[0][1] * 5 : 0;

      totalMaxWeight += initialWeight + maxEnhancement;
    } else {
      // 4-6号位（自由部位）：主词条是百分比属性，在副词条池中
      // 主副词条互斥，所以最多只有3个副词条
      // 需要遍历所有可能的主词条，找到最大值

      let slotMaxWeight = 0;
      const availableMainStats =
        SLOT_MAIN_POOLS[slot as keyof typeof SLOT_MAIN_POOLS];

      availableMainStats.forEach((mainStatName: string) => {
        // 计算该主词条下的最高分
        let mainStatWeight = 0;

        // 获取主词条权重
        if (mainStatName === "属性伤害%") {
          // 属性伤害需要匹配元素
          mainStatWeight = char.mainStats.V
            ? char.mainStats.V["属性伤害%"]
            : 1.0;
        } else {
          if (char.mainStats[slot]) {
            mainStatWeight = char.mainStats[slot][mainStatName] || 0;
          }
        }

        // 只有有效主词条才继续计算
        if (mainStatWeight > 0) {
          // 主词条权重
          const mainWeight = mainStatWeight * 3.0;

          // 排除主词条后，选择权重最高的副词条
          const availableSubStats: [string, number][] = (
            Object.entries(char.subStats) as [string, number][]
          )
            .filter(([name]) => name !== mainStatName) // 排除主词条
            .filter(([, weight]) => weight > 0)
            .sort((a, b) => b[1] - a[1]);

          // 最多3个副词条
          const top3SubStats = availableSubStats.slice(0, 3);

          // 计算副词条权重：3个副词条的初始值 + 5次提升全部给权重最高的
          const initialSubWeight = top3SubStats.reduce(
            (sum: number, [, weight]: [string, number]) => sum + weight,
            0,
          );
          const maxSubEnhancement =
            top3SubStats.length > 0 ? top3SubStats[0][1] * 5 : 0;

          const currentSlotWeight =
            mainWeight + initialSubWeight + maxSubEnhancement;
          if (currentSlotWeight > slotMaxWeight) {
            slotMaxWeight = currentSlotWeight;
          }
        }
      });

      totalMaxWeight += slotMaxWeight;
    }
  });

  return totalMaxWeight;
});

// 计算评分
const calculateScore = () => {
  let totalRawWeight = 0;
  let validMainCount = 0;
  let validSubTotalHits = 0;
  let invalidSubUpgrades = 0;
  let breakdown: any = {};

  const char = currentCharacter.value;

  slots.forEach((slot) => {
    const data = driveData.value[slot];
    const qualityMult =
      QUALITY_MULTIPLIERS[data.quality as keyof typeof QUALITY_MULTIPLIERS];
    const currentTotalUpgrades = data.subStats.reduce(
      (sum: number, s: any) => sum + s.upgrades,
      0,
    );
    const maxAllowedUpgrades = getMaxUpgradesForLevel(data.level);
    const remainingUpgrades = maxAllowedUpgrades - currentTotalUpgrades;
    const initialSubCount = getInitialSubSlots(data.level, remainingUpgrades);

    let actualWeight = 0;

    // 1. 主词条权重
    if (["IV", "V", "VI"].includes(slot) && data.mainStat) {
      let w = 0;
      if (data.mainStat === "属性伤害%") {
        if (data.element === char.element) {
          w = char.mainStats.V ? char.mainStats.V["属性伤害%"] : 1.0;
        }
      } else {
        if (char.mainStats[slot]) {
          w = char.mainStats[slot][data.mainStat] || 0;
        }
      }
      if (w > 0) validMainCount++;
      actualWeight += w * 3.0;
    }

    // 2. 副词条权重 (初始词条 + 强化词条)
    data.subStats.forEach((sub: any) => {
      if (sub.name) {
        const isHighlight = char.highlightSubStats.includes(sub.name);
        if (isHighlight) {
          // 高亮词条：计入有效副词条和分数
          const w = (char.subStats as any)[sub.name] || 0;
          const totalHits = 1 + sub.upgrades;
          validSubTotalHits += totalHits;
          actualWeight += w * totalHits;

          const key = sub.name;
          if (!breakdown[key]) breakdown[key] = 0;
          breakdown[key] += w * totalHits * qualityMult;
        } else {
          // 非高亮词条：计入无效副词条（包括初始+强化）
          const totalHits = 1 + sub.upgrades;
          invalidSubUpgrades += totalHits;
        }
      }
    });

    totalRawWeight += actualWeight * qualityMult;
  });

  const currentMaxWeight = maxPossibleWeight.value;
  const finalScore = (totalRawWeight / currentMaxWeight) * 100;

  // 评级判断
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

  scoreResult.value = {
    totalScore: finalScore,
    grade,
    gradeClass,
    gradeDesc,
    validMainCount,
    validSubTotalHits,
    invalidSubUpgrades,
    breakdown,
  };

  showResult.value = true;

  // 等待 DOM 更新后再执行滚动操作
  nextTick(() => {
    if (results.value) {
      results.value.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  });
};

// 重置所有
const resetAll = () => {
  driveData.value = initDriveData();
  showResult.value = false;
};
</script>

<style scoped>
.manual-entry {
  padding: 20px 0;
}

.switch-hint {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
}

.switch-btn {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.switch-btn:hover {
  background: var(--vp-c-divider);
  border-color: var(--main-color-1);
  color: var(--main-color-1);
}

/* 评级系统样式 */
.grade-sssp {
  color: #00eeff;
  text-shadow: 0 0 10px rgba(107, 220, 255, 0.5);
}

.grade-sss {
  color: #ff4444;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}

.grade-ss {
  color: #ff8c00;
}

.grade-s {
  color: #ffd700;
}

.grade-a {
  color: #c0c0c0;
}

.grade-b {
  color: #cd7f32;
}

.grade-c {
  color: #a0a0a0;
}

.grade-d {
  color: #808080;
}

.grade-e {
  color: #606060;
}

.grade-f {
  color: #404040;
}
</style>
