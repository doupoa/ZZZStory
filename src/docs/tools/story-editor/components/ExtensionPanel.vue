<template>
  <div v-if="isVisible"
    class="extension-panel fixed right-6 top-30 w-72 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-200 dark:border-[#3e3e42] z-50">
    <div class="px-4 py-3 border-b border-gray-200 dark:border-[#3e3e42] flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">扩展组件</h3>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
    </div>

    <div class="p-4">
      <div class="space-y-2 mb-4">
        <div v-for="comp in availableComponents" :key="comp.name"
          class="component-item p-2 rounded border border-gray-200 dark:border-[#3e3e42] hover:bg-gray-50 dark:hover:bg-[#2d2d30] cursor-pointer transition"
          @click="$emit('apply', comp.name)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ comp.icon }}</span>
              <div>
                <div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ comp.label }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ comp.desc }}</div>
              </div>
            </div>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ comp.shortcut }}</span>
          </div>
        </div>
      </div>

      <!-- <div class="border-t border-gray-200 dark:border-[#3e3e42] pt-4">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">自定义组件（预留扩展）</div>
        <div class="flex gap-2">
          <input v-model="customComponentName" type="text" placeholder="组件名称"
            class="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-[#3e3e42] rounded bg-white dark:bg-[#252526] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <button @click="addCustomComponent"
            class="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition">
            添加
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'apply'])

const customComponentName = ref('')

const availableComponents = [
  {
    name: 'Scene',
    label: '场景',
    desc: '描述故事场景',
    shortcut: 'Ctrl+1',
    icon: '🎬'
  },
  {
    name: 'Dialogue',
    label: '对话',
    desc: '角色对话内容',
    shortcut: 'Ctrl+2',
    icon: '💬'
  },
  {
    name: 'Action',
    label: '动作',
    desc: '角色动作描述',
    shortcut: 'Ctrl+3',
    icon: '⚡'
  },
  // {
  //   name: 'Narration',
  //   label: '旁白',
  //   desc: '旁白叙述内容',
  //   shortcut: 'Ctrl+4',
  //   icon: '📖'
  // }
]

const addCustomComponent = () => {
  if (!customComponentName.value.trim()) return
  alert(`自定义组件 "${customComponentName.value}" 功能预留，将在后续版本中实现`)
  customComponentName.value = ''
}
</script>

<style scoped>
.extension-panel {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
