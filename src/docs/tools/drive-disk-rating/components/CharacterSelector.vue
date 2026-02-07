<template>
  <div
    class="flex justify-center items-center gap-4 p-4 bg-white border border-gray-200! dark:border-gray-600! dark:bg-[#1e1e1e] rounded-lg"
  >
    <label class="text-base dark:text-gray-200 font-semibold">选择角色：</label>
    <select
      v-model="currentCharacterName"
      @change="handleCharacterChange"
      class="p-2! rounded dark:text-gray-200 text-sm min-w-[150px] border! border-gray-300! appearance-auto!"
    >
      <option
        v-for="charName in characterNames"
        :key="charName"
        :value="charName"
      >
        {{ charName }}
      </option>
    </select>
    <div class="text-xs flex">
      属性：<span class="text-[#4ecdc4] dark:text-teal-400 mr-2">{{
        currentCharacter.element
      }}</span>
      | 高亮词条：<span class="text-(--main-color-1)">{{
        currentCharacter.highlightSubStats.join("、")
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { buildCharacterConfigs, CharacterConfig } from "./ManualEntryTab_Method_Library.ts";

// 构建角色配置对象
const configs = buildCharacterConfigs();

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", character: CharacterConfig): void;
}>();

const currentCharacterName = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

const characterNames = computed(() => Object.keys(configs));

const currentCharacter = computed(() => {
  return configs[currentCharacterName.value];
});

const handleCharacterChange = () => {
  emit("change", currentCharacter.value);
};
</script>
