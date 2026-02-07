<template>
  <div class="flex items-center gap-2 px-2 rounde">
    <div class="flex-1 min-w-0">
      <select :value="stat.name" @change="handleStatNameChange"
        class="p-2! rounded dark:text-gray-200! text-sm border! border-gray-300! dark:border-gray-600! w-full appearance-auto!">
        <option value="">请选择词条</option>
        <option v-for="option in availableOptions" :key="option" :value="option" :style="{
          color: isHighlight(option) ? '#ee7309' : '',
          fontWeight: isHighlight(option) ? 'bold' : '',
        }">
          {{ option }}
        </option>
      </select>
    </div>

    <div class="flex items-center gap-0.5 rounded px-0.5">
      <button @click="handleUpgrade(-1)" :disabled="!canDecrease || !stat.name"
        class="border-none dark:bg-[#2d2d30] dark:text-gray-100! rounded cursor-pointer flex items-center justify-center text-base! font-bold dark:hover:bg-gray-600! disabled:opacity-30 disabled:cursor-not-allowed mx-1 hover:bg-gray-300! w-4 h-4">
        -
      </button>
      <span
        class="px-3 text-center text-sm dark:text-gray-200! font-bold border border-gray-300 dark:border-gray-600 rounded select-none">+{{
          stat.upgrades }}</span>
      <button @click="handleUpgrade(1)" :disabled="!canIncrease || !stat.name"
        class="border-none dark:bg-[#2d2d30] dark:text-gray-100! rounded cursor-pointer flex items-center justify-center text-base! font-bold dark:hover:bg-gray-600! disabled:opacity-30 disabled:cursor-not-allowed mx-1 hover:bg-gray-300! w-4 h-4">
        +
      </button>
    </div>

    <div class="w-[125px] flex flex-col items-end justify-center">
      <div class="text-xs text-gray-500 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
        <span v-if="stat.name && isHighlight(stat.name)" class="text-(--main-color-1) font-bold">
          {{ stat.name }} +{{ stat.upgrades }}
        </span>
        <span v-else>{{
          stat.name ? `${stat.name} +${stat.upgrades}` : "未选择词条"
        }}</span>
      </div>
      <div class="text-[11px]" :class="weightClass">
        {{
          weightInfo.weight > 0 ? `(${weightInfo.weight}权)` : "(无效 - 0权)"
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { SUB_STATS_POOL } from "zzz-drive-disk-rating";

// 定义类型
interface CharacterConfig {
  element: string;
  mainStats: {
    [slot: string]: { [stat: string]: number };
  };
  subStats: { [stat: string]: number };
  highlightSubStats: string[];
}

const props = defineProps<{
  index: number;
  stat: {
    name: string;
    upgrades: number;
  };
  selectedSubStats: string[];
  bannedSubStat: string;
  remainingUpgrades: number;
  character: CharacterConfig;
}>();

const emit = defineEmits<{
  (e: "update:name", index: number, value: string): void;
  (e: "update:upgrades", index: number, delta: number): void;
}>();

const availableOptions = computed(() => {
  return SUB_STATS_POOL.filter((statName) => {
    // 1. 唯一性检查
    if (props.selectedSubStats.includes(statName)) {
      const isMe = props.stat.name === statName;
      if (!isMe) return false;
    }
    // 2. 主副互斥检查
    if (statName === props.bannedSubStat) return false;
    return true;
  });
});

const weightInfo = computed(() => {
  if (!props.stat.name) return { weight: 0 };
  const w = props.character.subStats[props.stat.name] || 0;
  return { weight: w };
});

const weightClass = computed(() => {
  if (!props.stat.name) return "text-gray-500";
  return isHighlight(props.stat.name)
    ? "text-teal-500 dark:text-teal-400"
    : "text-gray-500";
});

const isHighlight = (statName: string) => {
  if (!statName) return false;
  return props.character.highlightSubStats.includes(statName);
};

const canIncrease = computed(() => {
  return props.stat.upgrades < 5 && props.remainingUpgrades > 0;
});

const canDecrease = computed(() => {
  return props.stat.upgrades > 0;
});

const handleStatNameChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update:name", props.index, target.value);
};

const handleUpgrade = (delta: number) => {
  emit("update:upgrades", props.index, delta);
};
</script>
