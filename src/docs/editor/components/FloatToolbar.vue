<template>
  <teleport to="body">
    <div v-if="showToolbar" class="float-toolbar" :style="{ top: position.top + 'px', left: position.left + 'px' }">
      <button v-for="comp in componentsConfig" :key="comp.name" @click.stop="handleApply(comp.name)" :title="comp.label"
        class="toolbar-btn">
        <span>{{ comp.icon }}<span class="text-sm">{{ comp.label }}</span></span>
      </button>

      <div class="divider"></div>

      <button @click.stop="handleToggleExtension" title="更多组件" class="toolbar-btn">
        <span>⚙️</span>
      </button>
    </div>
  </teleport>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'


const showToolbar = ref(false)
const position = reactive({ top: 0, left: 0 })

const componentsConfig = [
  { name: 'Scene', label: '场景', icon: '🎬' },
  { name: 'Dialogue', label: '对话', icon: '💬' },
  { name: 'Action', label: '动作', icon: '⚡' },
  // { name: 'Narration', label: '旁白', icon: '📖' }
]

const emit = defineEmits(['apply', 'toggleExtension'])

// 处理鼠标抬起，检测文本选择
const handleMouseUp = (event) => {
  const mouseX = event.clientX
  const mouseY = event.clientY

  const buttonEl = document.querySelector('.float-toolbar')

  // 如果点击的是工具栏本身，不处理
  if (buttonEl && buttonEl.contains(event.target)) return

  // 获取当前选中的文本
  const selection = window.getSelection()
  const text = selection?.toString().trim()

  if (!text) {
    showToolbar.value = false
    return
  }

  // 计算选区位置
  setTimeout(() => {
    // 统一使用鼠标位置计算工具栏位置
    let top = mouseY - 70  // 向上偏移40px
    let left = mouseX      // 使用鼠标X坐标

    // 获取工具栏元素尺寸进行边缘检测
    // 使用requestAnimationFrame来确保在DOM更新后再获取尺寸
    requestAnimationFrame(() => {
      const toolbarEl = document.querySelector('.float-toolbar')
      if (toolbarEl) {
        const toolbarRect = toolbarEl.getBoundingClientRect()
        const toolbarWidth = toolbarRect.width || toolbarEl.offsetWidth
        const toolbarHeight = toolbarRect.height || toolbarEl.offsetHeight

        // 边缘检测 - 确保工具栏不会超出屏幕边界
        const padding = 10 // 边缘留白
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        // 水平位置调整：确保工具栏不超出左右边界
        // 调整为鼠标位置减去工具栏宽度的一半，这样工具栏居中于鼠标位置
        let adjustedLeft = left - (toolbarWidth / 2)

        if (adjustedLeft + toolbarWidth > viewportWidth - padding) {
          // 如果右边超出边界，则右对齐到窗口边界
          adjustedLeft = viewportWidth - toolbarWidth - padding
        } else if (adjustedLeft < padding) {
          // 如果左边超出边界，则左对齐到窗口边界
          adjustedLeft = padding
        }

        // 垂直位置调整：确保工具栏不超出上下边界
        let adjustedTop = top
        if (adjustedTop + toolbarHeight > viewportHeight - padding) {
          // 如果下方空间不足，放在鼠标上方
          adjustedTop = mouseY - toolbarHeight - 10
          if (adjustedTop < padding) {
            // 如果上方也不够空间，则固定在顶部
            adjustedTop = padding
          }
        } else if (adjustedTop < padding) {
          // 如果上方空间不足，固定在顶部
          adjustedTop = padding
        }

        position.left = adjustedLeft
        position.top = adjustedTop
      }
    })

    // 由于使用了requestAnimationFrame，这里先设置初始位置
    position.top = top
    position.left = left
    showToolbar.value = true
  }, 0)
}
// 点击外部关闭工具栏
const handleClickOutside = (event) => {
  const buttonEl = document.querySelector('.float-toolbar')
  if (buttonEl && buttonEl.contains(event.target)) return

  showToolbar.value = false
}

// 应用组件
const handleApply = (componentName) => {
  emit('apply', componentName)
  showToolbar.value = false
}

// 切换扩展面板
const handleToggleExtension = () => {
  emit('toggleExtension')
  showToolbar.value = false
}

onMounted(() => {
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.float-toolbar {
  position: fixed;
  z-index: 9999;
  display: flex;
  gap: 8px;
  padding: 8px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark .float-toolbar {
  background-color: #1e1e1e;
  border-color: #3e3e42;
}

.toolbar-btn {
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 6px;
  transition: background-color 0.2s;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: none;
  background: transparent;
}

.toolbar-btn:hover {
  background-color: #409eff;
  color: #fff;
}

.dark .toolbar-btn:hover {
  background-color: #409eff;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: #ddd;
  align-self: center;
}

.dark .divider {
  background-color: #3e3e42;
}
</style>
