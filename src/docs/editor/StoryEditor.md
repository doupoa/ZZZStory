---
title: 剧情编辑器
layout: page
---

<div class="h-screen flex flex-col">
  <!-- 标题栏 -->
  <div class="h-14 px-6 flex items-center justify-between bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#3e3e42] shrink-0">
    <h1 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Story Editor - 剧情编辑器</h1>
    <div class="flex gap-2">
      <button @click="saveContent" class="flex items-center px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2d2d30] rounded hover:bg-gray-200 dark:hover:bg-[#3e3e42] transition">💾 保存</button>
      <button @click="exportToMarkdown" class="flex items-center px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2d2d30] rounded hover:bg-gray-200 dark:hover:bg-[#3e3e42] transition">📤 导出</button>
    </div>
  </div>
  <!-- 内容区 -->
  <div class="flex-1 flex overflow-hidden min-h-0">
    <!-- 编辑区 -->
    <div class="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-[#3e3e42] min-w-0">
      <div class="px-4 py-2 border-b border-gray-100 dark:border-[#2d2d30] flex items-center justify-between">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">文本编辑区</span>
        <span v-if="autoSaveStatus" class="text-xs text-green-600 dark:text-green-400">{{ autoSaveStatus }}</span>
      </div>
      <div class="flex-1 relative min-h-0 p-3">
        <textarea
          id="story-editor-textarea"
          ref="editorRef"
          v-model="rawText"
          @keydown="handleKeyDown"
          placeholder="在此输入或粘贴剧情文本... (选中文字后使用快捷键或点击悬浮工具栏应用样式)"
          class="w-full h-full p-6 text-gray-800 dark:text-gray-200 text-base font-mono resize-none focus:outline-none bg-white dark:bg-[#1e1e1e]"
        ></textarea>
      </div>
    </div>
    <!-- 预览区 -->
    <div class="flex-1 bg-gray-50 dark:bg-[#252526] overflow-auto min-w-0">
      <div class="px-4 py-2 border-b border-gray-200 dark:border-[#3e3e42] sticky top-0 bg-gray-50 dark:bg-[#252526] z-10">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">实时预览</span>
      </div>
      <div class="p-6">
        <div class="Story prose dark:prose-invert max-w-none" v-html="renderPreview"></div>
      </div>
    </div>
  </div>
  <!-- 角色选择器 -->
  <div v-if="showRoleSelector" class="fixed left-1/5 transform -translate-x-1/2 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-200 dark:border-[#3e3e42] p-4 z-50">
    <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择角色</div>
    <select
      v-model="selectedRole"
      @change="insertRole(selectedRole)"
      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#3e3e42] rounded bg-white dark:bg-[#252526] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="" disabled>请选择角色</option>
      <option v-for="role in dialogueRoles" :key="role" :value="role">
        {{ role }}
      </option>
    </select>
  </div>
  <!-- 扩展面板 -->
  <ExtensionPanel
    :isVisible="showExtensionPanel"
    @close="showExtensionPanel = false"
    @apply="handleToolbarApply"
  />
  <!-- 悬浮工具栏 -->
  <FloatToolbar
    @apply="handleToolbarApply"
    @toggleExtension="showExtensionPanel = !showExtensionPanel"
  />
</div>

<style>
/* CSS 变量定义 - 亮色模式 */
:root {
  --scene-color: #888;
  --scene-border: var(--main-color-1);
  --action-color: rgb(255, 162, 0);
  --action-bg: rgba(0, 0, 0, 0.03);
  --action-border: rgba(0, 0, 0, 0.1);
  --dialogue-quote-color: var(--main-color-1);
  --narration-color: #888;
  --narration-border: #999;
}

/* 暗色模式变量 */
.dark {
  --scene-color: #999;
  --action-color: rgb(255, 180, 60);
  --action-bg: rgba(255, 255, 255, 0.05);
  --action-border: rgba(255, 255, 255, 0.1);
  --narration-color: #aaa;
  --narration-border: #aaa;
}

/* Scene 组件样式 */
.scene {
  display: block;
  font-style: italic;
  color: var(--scene-color);
  margin: 1.5em 0;
  padding-left: 1em;
  border-left: 2px solid var(--scene-border);
}

/* Action 组件样式 */
.action {
  background: var(--action-bg);
  padding: 0.5rem;
  border-radius: 4px;
  margin: 1.2rem 1.5rem;
  font-size: 0.9em;
  border: 1px dashed var(--action-border);
  color: var(--action-color);
}

/* Dialogue 组件样式 */
.dialogue {
  margin: 1.2em 0;
  position: relative;
  padding-left: 1.5rem;
  font-weight: bold;
}

.dialogue::before {
  content: "\"";
  position: absolute;
  left: 0;
  top: -0.5rem;
  font-size: 2.5rem;
  color: var(--dialogue-quote-color);
  font-family: Georgia, serif;
}

.character {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-right: 0.5rem;
}

/* Narration 组件样式 */
/* .narration {
  font-style: italic;
  color: var(--narration-color);
  padding: 0.5em 1em;
  margin: 1em 0;
  background: var(--action-bg);
  border-left: 3px solid var(--narration-border);
} */
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import FloatToolbar from './components/FloatToolbar.vue'
import ExtensionPanel from './components/ExtensionPanel.vue'


// 编辑器内容
const rawText = ref('')
const editorRef = ref(null)
const selectedRole = ref('')
const showRoleSelector = ref(false)
const showExtensionPanel = ref(false)
const autoSaveStatus = ref('')

// 历史记录管理（保留15条）
const MAX_HISTORY = 15
const undoStack = ref([])
const redoStack = ref([])
let isRecordingHistory = false

// 角色列表
const dialogueRoles = [
  '玲',
  '哲',
  'Fairy',
  '(正在直播的电视)',
  '(蓝发少女)',
  '(灰发少年)',
  '妮可',
  '安比',
  '比利',
  '⌈ 白佬 ⌋'
]

// 定义角色颜色规则
const roles = {
  "random_play": {
    "铃": ["#254fff", "#fd802dbf"],
    "哲": ["#ffffff", "#fd802dbf"],
    "Fairy": ["#1e3c72", "#1e3c7233"],
    "(蓝发少女)": ["#254fff", "#fd802dbf"],
    "(灰发少年)": ["#ffffff", "#fd802dbf"]
  },
  "cunning_hares": {
    "安比": ["#b3cc58", "#C8E16C33"],
    "比利": ["#cc4f4b", "#AF3E3A33"],
    "妮可": ["#cd8583", "#E6ADAA33"],
    "猫又": ["#A0351C", "#A0351C33"],
    "(粉毛长发少女)": ["#cd8583", "#E6ADAA33"],
    "(白毛短发少女)": ["#cc4f4b", "#AF3E3A33"]
  },
  "other": { "npc": ["dodgerblue", "#7c7c7c46"] }
}

const getRoleColors = (role) => {
  let colors = ['dodgerblue', "#7c7c7c46"]
  for (const camp of Object.keys(roles)) {
    const campRoles = roles[camp]
    if (campRoles[role]) {
      colors = campRoles[role]
      break
    }
  }
  return {
    color: colors[0],
    background: colors[1]
  }
}

// 存储键
const STORAGE_KEY = 'zzz-story-editor-content'

// 加载保存的内容
const loadContent = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    rawText.value = saved
  }
}

// 保存内容
const saveContent = () => {
  localStorage.setItem(STORAGE_KEY, rawText.value)
  autoSaveStatus.value = '已保存 ✓'
  setTimeout(() => {
    autoSaveStatus.value = ''
  }, 2000)
}

// 自动保存（防抖）
let autoSaveTimeout = null
watch(rawText, (newVal, oldVal) => {
  // 记录历史
  if (!isRecordingHistory && oldVal !== '') {
    recordHistory(oldVal)
  }
  
  autoSaveStatus.value = '保存中...'
  clearTimeout(autoSaveTimeout)
  autoSaveTimeout = setTimeout(() => {
    saveContent()
  }, 2000)
})

// 记录历史
const recordHistory = (content) => {
  // 如果内容相同，不记录
  if (content === rawText.value) return
  
  // 添加到撤销栈
  undoStack.value.push(content)
  
  // 限制历史记录数量
  if (undoStack.value.length > MAX_HISTORY) {
    undoStack.value.shift()
  }
  
  // 清空重做栈（新操作会清除重做历史）
  redoStack.value = []
}

// 撤销
const undo = () => {
  if (undoStack.value.length === 0) {
    autoSaveStatus.value = '已到最早记录'
    setTimeout(() => {
      autoSaveStatus.value = ''
    }, 1000)
    return
  }
  
  // 记录当前内容到重做栈
  redoStack.value.push(rawText.value)
  
  // 取出上一个状态
  const previousState = undoStack.value.pop()
  
  isRecordingHistory = true
  rawText.value = previousState
  isRecordingHistory = false
  
  autoSaveStatus.value = '已撤销'
  setTimeout(() => {
    autoSaveStatus.value = ''
  }, 1000)
}

// 重做
const redo = () => {
  if (redoStack.value.length === 0) {
    autoSaveStatus.value = '已到最新记录'
    setTimeout(() => {
      autoSaveStatus.value = ''
    }, 1000)
    return
  }
  
  // 记录当前内容到撤销栈
  undoStack.value.push(rawText.value)
  
  // 取出重做的状态
  const nextState = redoStack.value.pop()
  
  isRecordingHistory = true
  rawText.value = nextState
  isRecordingHistory = false
  
  autoSaveStatus.value = '已重做'
  setTimeout(() => {
    autoSaveStatus.value = ''
  }, 1000)
}

// 导出为Markdown
const exportToMarkdown = () => {
  const content = rawText.value
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `story_${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
  autoSaveStatus.value = '已导出 ✓'
  setTimeout(() => {
    autoSaveStatus.value = ''
  }, 2000)
}

// 处理工具栏应用
const handleToolbarApply = (componentName) => {
  const selection = window.getSelection()
  const selectedText = selection?.toString().trim()
  
  if (!selectedText) {
    alert('请先选中要应用样式的文字')
    return
  }

  // 获取textarea的光标位置
  const textarea = document.getElementById('story-editor-textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  if (start === end) return

  let wrappedText = ''

  switch (componentName) {
    case 'Scene':
      wrappedText = `<Scene>${selectedText}</Scene>`
      break
    case 'Action':
      wrappedText = `<Action>${selectedText}</Action>`
      break
    case 'Narration':
      wrappedText = `<Narration>${selectedText}</Narration>`
      break
    case 'Dialogue':
      // 显示角色选择器
      showRoleSelector.value = true
      return
    default:
      wrappedText = `<${componentName}>${selectedText}</${componentName}>`
  }

  rawText.value = rawText.value.substring(0, start) +
    wrappedText +
    rawText.value.substring(end)

  // 清除选择
  selection.removeAllRanges()
}

// 插入角色
const insertRole = (role) => {
  if (!role) return

  const textarea = document.getElementById('story-editor-textarea')
  if (!textarea) return

  const selection = window.getSelection()
  const selectedText = selection?.toString().trim()
  
  if (!selectedText) {
    alert('请先选中要应用样式的文字')
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  const wrappedText = `<Dialogue role="${role}">${selectedText}</Dialogue>`

  rawText.value = rawText.value.substring(0, start) +
    wrappedText +
    rawText.value.substring(end)

  // 清除选择并重置状态
  selection.removeAllRanges()
  selectedRole.value = ''
  showRoleSelector.value = false
}

// 处理快捷键
const handleKeyDown = (event) => {
  const textarea = document.getElementById('story-editor-textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  // 只有在有选中文本时才响应组件快捷键
  const hasSelection = start !== end

  // Ctrl/Command + 1: Scene
  if (hasSelection && (event.ctrlKey || event.metaKey) && event.key === '1') {
    event.preventDefault()
    handleToolbarApply('Scene')
  }
  // Ctrl/Command + 2: Dialogue
  else if (hasSelection && (event.ctrlKey || event.metaKey) && event.key === '2') {
    event.preventDefault()
    handleToolbarApply('Dialogue')
  }
  // Ctrl/Command + 3: Action
  else if (hasSelection && (event.ctrlKey || event.metaKey) && event.key === '3') {
    event.preventDefault()
    handleToolbarApply('Action')
  }
  // Ctrl/Command + 4: Narration
  else if (hasSelection && (event.ctrlKey || event.metaKey) && event.key === '4') {
    event.preventDefault()
    handleToolbarApply('Narration')
  }
  // Ctrl/Command + S: 保存
  else if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    saveContent()
  }
  // Ctrl/Command + E: 导出
  else if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault()
    exportToMarkdown()
  }
  // Ctrl/Command + Z: 撤销
  else if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
  }
  // Ctrl/Command + Y 或 Ctrl+Shift+Z: 重做
  else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault()
    redo()
  }
  // Escape: 关闭面板
  else if (event.key === 'Escape') {
    showRoleSelector.value = false
    showExtensionPanel.value = false
  }
}

// 解析并渲染预览内容
const renderPreview = computed(() => {
  let html = rawText.value

  // 替换 Scene 标签
  html = html.replace(/<Scene>(.*?)<\/Scene>/gs, '<div class="scene">$1</div>')

  // 替换 Action 标签
  html = html.replace(/<Action>(.*?)<\/Action>/gs, '<div class="action">$1</div>')

  // 替换 Narration 标签
  html = html.replace(/<Narration>(.*?)<\/Narration>/gs, '<div class="narration">$1</div>')

  // 替换 Dialogue 标签
  html = html.replace(/<Dialogue\s+role="([^"]*)">(.*?)<\/Dialogue>/gs, (match, role, content) => {
    const colors = getRoleColors(role)
    return `<div class="dialogue"><span class="character" style="color: ${colors.color}; background: ${colors.background};">${role}</span>${content}</div>`
  })

  return html
})

// 生命周期钩子
onMounted(() => {
  loadContent()
})

onUnmounted(() => {
  clearTimeout(autoSaveTimeout)
})
</script>
