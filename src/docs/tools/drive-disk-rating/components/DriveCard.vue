<template>
  <div
    class="text-black bg-white dark:bg-[#252525] rounded-lg p-4 border border-gray-300 dark:border-gray-600"
  >
    <div class="flex justify-between items-center pb-2">
      <span class="font-semibold dark:text-gray-300">
        {{ isFixedSlot ? "固定主词条分区" : "自由主词条分区" }} {{ slotId }}
      </span>
      <span
        class="bg-gray-300 dark:bg-black/20 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded text-xs"
      >
        {{ slotId }}号位
      </span>
    </div>

    <!-- 基础信息 -->
    <div class="flex gap-2.5 mb-2.5">
      <select
        :value="data.quality"
        @change="handleUpdate('quality', $event)"
        class="p-2! rounded dark:text-gray-200! text-sm border! border-gray-300! dark:border-gray-600! w-full appearance-auto!"
      >
        <option value="S" class="dark:text-black">S级</option>
        <option value="A" class="dark:text-black">A级</option>
        <option value="B" class="dark:text-black">B级</option>
      </select>
      <select
        :value="data.level"
        @change="handleUpdate('level', $event)"
        class="p-2! rounded dark:text-gray-200! text-sm border! border-gray-300! dark:border-gray-600! w-full appearance-auto!"
      >
        <option v-for="i in 16" :key="i - 1" :value="i - 1" class="dark:text-black">
          {{ i - 1 }}级
        </option>
      </select>
    </div>

    <div
      class="flex justify-between items-center py-1 text-xs text-[#888] dark:text-gray-300"
    >
      <span>初始词条: {{ initialSubCount }} 条</span>
      <span
        >强化提升: {{ currentTotalUpgrades }}/{{ maxAllowedUpgrades }} 次</span
      >
    </div>

    <!-- 主词条 -->
    <div class="mb-4  rounded">
      <span class="block text-xs  dark:text-gray-400 mb-1.5">
        {{ isFixedSlot ? "主词条 (固定)" : "主词条 (选择)" }}
      </span>

      <select
        v-if="isFixedSlot"
        disabled
        class="p-2! rounded dark:text-gray-200! border! border-gray-300! dark:border-gray-600! text-sm w-full disabled:text-gray-400! disabled:cursor-not-allowed appearance-auto!"
      >
        <option>{{ data.mainStat }}</option>
      </select>

      <template v-else>
        <select
          :value="data.mainStat"
          @change="handleMainStatChange"
          class="p-2! rounded dark:text-gray-200! text-sm border! border-gray-300! dark:border-gray-600! w-full appearance-auto! "
        >
          <option value="" class="dark:text-black text-gray-400!">请选择主词条</option>
          <option v-for="stat in mainStatOptions" :key="stat" :value="stat" class="dark:text-black">
            {{ stat }}
          </option>
        </select>

        <!-- 元素选择器（仅当主词条为属性伤害%时显示） -->
        <div v-if="data.mainStat === '属性伤害%'" class="flex gap-2 mt-2">
          <span
            class="text-xs text-[#888] dark:text-gray-400 self-center whitespace-nowrap"
            >属性:</span
          >
          <select
            :value="data.element"
            @change="handleUpdate('element', $event)"
            class="p-2! rounded dark:text-gray-200! text-sm border! border-gray-300! dark:border-gray-600! w-full appearance-auto! "
          >
            <option v-for="el in ELEMENTS" :key="el" :value="el" class="dark:text-black">
              {{ el }}
            </option>
          </select>
          <span
            v-if="data.element === character.element"
            class="text-xs text-(--main-color-1) self-center whitespace-nowrap"
          >
            ✔有效
          </span>
        </div>

        <div class="text-[11px] mt-1.5" :class="mainStatWeightClass">
          {{ mainStatWeightText }}
        </div>
      </template>
    </div>

    <!-- 副词条列表 -->
    <div class="flex flex-col rounded gap-2">
      <span class="text-xs dark:text-gray-400"> 副词条选择 </span>
      <SubStatRow
        v-for="(subStat, index) in data.subStats"
        :key="index"
        :index="index"
        :stat="subStat"
        :selected-sub-stats="selectedSubStats"
        :banned-sub-stat="data.mainStat"
        :remaining-upgrades="remainingUpgrades"
        :character="character"
        @update:name="handleSubStatNameUpdate"
        @update:upgrades="handleSubStatUpgrade"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SubStatRow from "./SubStatRow.vue";
import { SLOT_MAIN_POOLS } from "./rating_algorithm.ts";
import characterWeights from "../character-weights.json";

// 从 JSON 中提取配置
const { ELEMENTS } = characterWeights;

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

// 定义类型
interface CharacterConfig {
  element: string;
  mainStats: {
    [slot: string]: { [stat: string]: number };
  };
  subStats: { [stat: string]: number };
  highlightSubStats: string[];
}

interface DriveData {
  quality: string;
  level: number;
  mainStat: string;
  element: string;
  subStats: { name: string; upgrades: number }[];
}

const props = defineProps<{
  slotId: string;
  data: DriveData;
  character: CharacterConfig;
}>();

const emit = defineEmits<{
  (e: "update:basic", slotId: string, field: string, value: string): void;
  (e: "update:mainStat", slotId: string, value: string): void;
  (
    e: "update:subStat",
    slotId: string,
    index: number,
    field: string,
    value: number | string,
  ): void;
}>();

const isFixedSlot = computed(() => ["I", "II", "III"].includes(props.slotId));

const mainStatOptions = computed(() => {
  // 将罗马数字 slotId 转换为数字
  const slotNumberMap: Record<string, number> = {
    "I": 1,
    "II": 2,
    "III": 3,
    "IV": 4,
    "V": 5,
    "VI": 6
  };
  const slotNumber = slotNumberMap[props.slotId] || 1;
  return SLOT_MAIN_POOLS[slotNumber] || [];
});

const selectedSubStats = computed(() => {
  return props.data.subStats.map((s) => s.name).filter((n) => n);
});

const currentTotalUpgrades = computed(() => {
  return props.data.subStats.reduce((sum, s) => sum + s.upgrades, 0);
});

const maxAllowedUpgrades = computed(() => {
  return getMaxUpgradesForLevel(props.data.level);
});

const remainingUpgrades = computed(() => {
  return maxAllowedUpgrades.value - currentTotalUpgrades.value;
});

const initialSubCount = computed(() => {
  return getInitialSubSlots(props.data.level, remainingUpgrades.value);
});

const mainStatWeightText = computed(() => {
  if (!props.data.mainStat) return "";

  let w = 0;
  if (props.data.mainStat === "属性伤害%") {
    if (props.data.element === props.character.element) {
      w = props.character.mainStats.V
        ? props.character.mainStats.V["属性伤害%"]
        : 1.0;
    }
  } else {
    // 根据部位获取主词条权重
    if (props.character.mainStats[props.slotId]) {
      w = props.character.mainStats[props.slotId][props.data.mainStat] || 0;
    }
  }

  if (w > 0) return `权重: ${w} (主词条价值 = 3副词条)`;
  return "(无效属性)";
});

const mainStatWeightClass = computed(() => {
  return props.data.mainStat && mainStatWeightText.value.includes("权重")
    ? "text-(--main-color-1) dark:text-teal-400"
    : "text-gray-400";
});

const handleUpdate = (field: string, event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update:basic", props.slotId, field, target.value);
};

const handleMainStatChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update:mainStat", props.slotId, target.value);
};

const handleSubStatNameUpdate = (index: number, value: string) => {
  emit("update:subStat", props.slotId, index, "name", value);
};

const handleSubStatUpgrade = (index: number, delta: number) => {
  emit("update:subStat", props.slotId, index, "upgrades", delta);
};
</script>
