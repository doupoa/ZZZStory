<template>
  <div
    class="editor-toolbar px-4 py-2 bg-gray-100 dark:bg-[#2d2d30] border-b border-gray-200 dark:border-[#3e3e42] flex items-center gap-2 flex-wrap">
    <button v-for="comp in componentsConfig" :key="comp.name" @click="$emit('apply', comp.name)" :title="comp.shortcut"
      class="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1e1e1e] rounded border border-gray-200 dark:border-[#3e3e42] hover:bg-gray-100 dark:hover:bg-[#3e3e42] transition flex items-center gap-2">
      <span>{{ comp.icon }}</span>
      <span>{{ comp.label }}</span>
      <span class="text-xs text-gray-400 dark:text-gray-500">({{ comp.shortcut }})</span>
    </button>

    <div class="w-px h-6 bg-gray-300 dark:bg-[#4e4e52] mx-1"></div>

    <button @click="$emit('toggleExtension')"
      class="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1e1e1e] rounded border border-gray-200 dark:border-[#3e3e42] hover:bg-gray-100 dark:hover:bg-[#3e3e42] transition flex items-center gap-2">
      <span>⚙️</span>
      <span>更多组件</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 组件配置
const componentsConfig = computed(() => [
  {
    name: 'Scene',
    label: '场景',
    shortcut: 'Ctrl+1',
    icon: '🎬'
  },
  {
    name: 'Dialogue',
    label: '对话',
    shortcut: 'Ctrl+2',
    icon: '💬'
  },
  {
    name: 'Action',
    label: '动作',
    shortcut: 'Ctrl+3',
    icon: '⚡'
  },
  // {
  //   name: 'Narration',
  //   label: '旁白',
  //   shortcut: 'Ctrl+4',
  //   icon: '📖'
  // }
])

defineEmits(['apply', 'toggleExtension'])
</script>
