<template>
  <div
    v-if="visible"
    ref="resultPanelRef"
    class="bg-white dark:bg-[#252525] p-5 rounded-lg border border-gray-200 dark:border-gray-600"
  >
    <div class="text-center mb-5">
      <div class="text-5xl font-bold dark:text-gray-200">
        {{ scoreResult.totalScore.toFixed(1) }}
      </div>
      <div
        class="inline-block mt-1.5 px-3 py-1 rounded font-bold text-2xl"
        :class="gradeClass"
      >
        {{ scoreResult.grade }}
      </div>
      <div class="text-base dark:text-gray-500 mt-1.5">
        {{ scoreResult.gradeDesc }}
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      <div
        class="border border-gray-200 dark:border-gray-600 dark:bg-[#1a1a1a] p-4 rounded text-center"
      >
        <div class="text-xs text-gray-400 dark:text-gray-500 mb-1">
          有效主词条
        </div>
        <div class="text-lg font-bold dark:text-gray-200">
          {{ scoreResult.validMainCount }}/3
        </div>
      </div>
      <div
        class="border border-gray-200 dark:border-gray-600 dark:bg-[#1a1a1a] p-4 rounded text-center"
      >
        <div class="text-xs text-gray-400 dark:text-gray-500 mb-1">
          有效副词条(初始+强化)
        </div>
        <div class="text-lg font-bold dark:text-gray-200">
          {{ scoreResult.validSubTotalHits }}
        </div>
      </div>
      <div
        class="border border-gray-200 dark:border-gray-600 dark:bg-[#1a1a1a] p-4 rounded text-center"
      >
        <div class="text-xs text-gray-400 dark:text-gray-500 mb-1">
          无效副词条提升
        </div>
        <div class="text-lg font-bold text-[#ff6b6b]">
          {{ scoreResult.invalidSubUpgrades }}
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div
        v-for="[key, val] in sortedBreakdown"
        :key="key"
        class="flex justify-between items-center p-2 bg-gray-200 dark:bg-[#1a1a1a] rounded text-xs"
      >
        <span class="dark:text-gray-400">{{ key }}</span>
        <span class="font-bold dark:text-gray-200">
          贡献 +{{ ((val / maxWeight) * 100).toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

// 定义类型
interface ScoreResult {
  totalScore: number;
  grade: string;
  gradeClass: string;
  gradeDesc: string;
  validMainCount: number;
  validSubTotalHits: number;
  invalidSubUpgrades: number;
  breakdown: { [key: string]: number };
}

// 添加对根元素的引用
const resultPanelRef = ref<HTMLElement | null>(null);

// 暴露滚动方法
defineExpose({
  scrollToView: () => {
    if (resultPanelRef.value) {
      resultPanelRef.value.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  },
  element: resultPanelRef,
});

const props = defineProps<{
  visible: boolean;
  scoreResult: ScoreResult;
  maxWeight: number;
}>();

const gradeClass = computed(() => {
  const grade = props.scoreResult.grade;

  if (grade === "SSS+") return "grade-sssp";
  if (grade === "SSS") return "grade-sss";
  if (grade === "SS") return "grade-ss";
  if (grade === "S") return "grade-s";
  if (grade === "A") return "grade-a";
  if (grade === "B") return "grade-b";
  if (grade === "C") return "grade-c";
  if (grade === "D") return "grade-d";
  if (grade === "E") return "grade-e";
  return "grade-f";
});

const sortedBreakdown = computed(() => {
  return Object.entries(props.scoreResult.breakdown).sort(
    (a, b) => b[1] - a[1],
  );
});
</script>

<style scoped>
/* 评级系统样式 */
.grade-sssp {
  color: #00eeff;
  text-shadow: 0 0 10px rgba(107, 220, 255, 0.7);
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
  color: #b711d8;
}

.grade-b {
  color: #2d49c7;
}

.grade-c {
  color: #a0a0a0;
  .dark & {
    color: #8d8d8d;
  }
}

.grade-d {
  color: #808080;
  .dark & {
    color: #808080;
  }
}

.grade-e {
  color: #606060;
  .dark & {
    color: #808080;
  }
}

.grade-f {
  color: #404040;
  .dark & {
    color: #808080;
  }
}
</style>
