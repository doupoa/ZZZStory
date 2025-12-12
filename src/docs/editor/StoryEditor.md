---
title: 剧情编辑器
layout: page
---

<div class="w-full min-h-screen  p-4 md:p-6">
  <div class="flex flex-col lg:flex-row gap-6 h-full">
    <!-- 左侧编辑区域 -->
    <div class="flex-1 flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="bg-linear-to-r from-blue-500 to-indigo-600 p-4 text-white">
        <h2 class="text-xl font-bold">文本编辑区</h2>
        <div class="mt-2 flex flex-wrap gap-2" v-if="selectionRange.start !== selectionRange.end">
          <select
            v-model="selectedComponent"
            @change="insertComponent(selectedComponent)"
            class="bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="" disabled>选择组件</option>
            <option v-for="comp in components" :key="comp.name" :value="comp.name">
              {{ comp.label }}
            </option>
          </select>
          <select
            v-if="selectedComponent === 'Dialogue'"
            @change="insertRole($event.target.value)"
            class="bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="" disabled selected>选择角色</option>
            <option v-for="role in dialogueRoles" :key="role" :value="role">
              {{ role }}
            </option>
          </select>
        </div>
      </div>
      <textarea
        v-model="rawText"
        @mouseup="handleTextSelection"
        @keyup="handleTextSelection"
        @touchend="handleTextSelection"
        placeholder="在此输入或粘贴剧情文本..."
        class="flex-1 w-full p-6 text-gray-700 text-base font-mono resize-none focus:outline-none"
      ></textarea>
      <div
        class="px-6 py-3 bg-gray-100 border-t border-gray-200 text-sm" 
        v-if="selectionRange.start !== selectionRange.end"
      >
        已选择: {{ selectionRange.start }} - {{ selectionRange.end }} ({{ selectionRange.end - selectionRange.start }} 字符)
      </div>
    </div>
    <!-- 右侧预览区域 -->
    <div class="flex-1 flex flex-col rounded-xl shadow-lg overflow-hidden">
      <div class="bg-linear-to-r from-green-500 to-emerald-600 p-4 text-white">
        <h2 class="text-xl font-bold">实时预览</h2>
      </div>
      <div class="flex-1 overflow-auto p-6 ">
        <div class="Story prose max-w-none" v-html="renderPreview"></div>
      </div>
    </div>
  </div>
</div>

<script setup>
import { ref, reactive, computed } from 'vue'

const rawText = ref(`# 示例剧情

<Scene>某处房间内，台上的电视正在播报新闻</Scene>

<Dialogue role="(正在直播的电视)">插播一条紧急新闻</Dialogue>

<Dialogue role="(正在直播的电视)">十四分街突发伴生空洞灾害，已突破现场三级管制</Dialogue>

<Dialogue role="(正在直播的电视)">空洞调查协会已向现场派遣调查团队进行应急处理</Dialogue>

<Dialogue role="(正在直播的电视)">附近街区居民的疏散工作也在同步进行中</Dialogue>

<Dialogue role="(正在直播的电视)">请广大市民们切勿接近十四分街...</Dialogue>

<Action>电视机前，一只长着兔子耳朵圆圆的机器人看到新闻，喊着"嗯呢嗯呢"跑向在沙发上酣睡的蓝色短发少女</Action>

<Dialogue role="(蓝发少女)">哥，快来看看这个新闻</Dialogue>`)

const selectedComponent = ref('')
const selectionRange = reactive({
start: 0,
end: 0
})

const components = [
{ name: 'Scene', label: '场景' },
{ name: 'Dialogue', label: '对话' },
{ name: 'Action', label: '动作' }
]

const dialogueRoles = [
'(正在直播的电视)',
'(蓝发少女)',
'(灰发少年)',
'妮可',
'安比',
'比利',
'⌈ 白佬 ⌋'
]

// 定义角色颜色规则（与Dialogue.vue组件中保持一致）
const roles = {
"random_play": { //录像店
"铃": ["#254fff", "#fd802dbf"],
"哲": ["#ffffff", "#fd802dbf"],
"(蓝发少女)": ["#254fff", "#fd802dbf"],
"(灰发少年)": ["#ffffff", "#fd802dbf"]
},
"cunning_hares": { //狡兔屋
"安比": ["#b3cc58", "#C8E16C33"],
"比利": ["#cc4f4b", "#AF3E3A33"],
"妮可": ["#cd8583", "#E6ADAA33"],
"(粉毛长发少女)": ["#cd8583", "#E6ADAA33"],
"(白毛短发少女)": ["#cc4f4b", "#AF3E3A33"]
},
"other": { "npc": ["dodgerblue", "#7c7c7c46"] } //其他角色
}

const getRoleColors = (role) => {
// 默认颜色
let colors = ['dodgerblue', "#7c7c7c46"]

// 查找角色颜色
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

const insertComponent = (componentName) => {
if (selectionRange.start === selectionRange.end) return

let wrappedText = ''
switch (componentName) {
case 'Scene':
wrappedText = `<Scene>${rawText.value.substring(selectionRange.start, selectionRange.end)}</Scene>`
break
case 'Action':
wrappedText = `<Action>${rawText.value.substring(selectionRange.start, selectionRange.end)}</Action>`
break
case 'Dialogue':
wrappedText = `<Dialogue role="">${rawText.value.substring(selectionRange.start, selectionRange.end)}</Dialogue>`
break
}

rawText.value = rawText.value.substring(0, selectionRange.start) +
wrappedText +
rawText.value.substring(selectionRange.end)

// 重置选择
selectionRange.start = 0
selectionRange.end = 0
selectedComponent.value = ''
}

const handleTextSelection = (event) => {
const textarea = event.target
const start = textarea.selectionStart
const end = textarea.selectionEnd

if (start !== end) {
selectionRange.start = start
selectionRange.end = end
} else {
// 如果没有选择文本，重置选择状态
selectionRange.start = 0
selectionRange.end = 0
selectedComponent.value = ''
}
}

const insertRole = (role) => {
if (selectionRange.start === selectionRange.end) return

// 查找选中文本所在的 Dialogue 标签位置
const beforeText = rawText.value.substring(0, selectionRange.start)
const lastDialogueIndex = beforeText.lastIndexOf('<Dialogue')

if (lastDialogueIndex !== -1) {
const restOfText = rawText.value.substring(lastDialogueIndex)
const closingBracketIndex = restOfText.indexOf('>')

if (closingBracketIndex !== -1) {
const beforeTag = rawText.value.substring(0, lastDialogueIndex)
const dialogTagPart = restOfText.substring(0, closingBracketIndex + 1)
const afterTag = restOfText.substring(closingBracketIndex + 1)

// 替换 role 属性
const updatedDialogTag = dialogTagPart.replace(/role="[^"]*"/, `role="${role}"`)

rawText.value = beforeTag + updatedDialogTag + afterTag

// 重置选择
selectionRange.start = 0
selectionRange.end = 0
selectedComponent.value = ''
}
}
}

// 解析并渲染预览内容
const renderPreview = computed(() => {
let html = rawText.value

// 替换 Scene 标签
html = html.replace(/<Scene>(.*?)<\/Scene>/gs, '<div class="scene">$1</div>')

// 替换 Action 标签
html = html.replace(/<Action>(.*?)<\/Action>/gs, '<div class="action">$1</div>')

// 替换 Dialogue 标签
html = html.replace(/<Dialogue\s+role="([^"]*)">(.*?)<\/Dialogue>/gs, (match, role, content) => {
const colors = getRoleColors(role)
return `<div class="dialogue"><span class="character" style="color: ${colors.color}; background: ${colors.background};">${role}</span>${content}</div>`
})

return html
})
</script>

<style module>
textarea {
  flex: 1;
  padding: 16px;
  border: none;
  resize: none;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

textarea:focus {
  outline: none;
}

.action {
    background: rgba(0, 0, 0, 0.03);
    padding: 0.5rem;
    border-radius: 4px;
    margin: 1.2rem 1.5rem;
    font-size: 0.9em;
    border: 1px dashed rgba(0, 0, 0, 0.1);
    color:rgb(255, 162, 0);
  }

  .dialogue {
    margin: 1.2em 0;
    position: relative;
    padding-left: 1.5rem;
    font-weight: bold;
}

.dialogue::before {
    content: "“";
    position: absolute;
    left: 0;
    top: -0.5rem;
    font-size: 2.5rem;
    color: var(--main-color-1);
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

.scene {
    display: block;
    font-style: italic;
    color: #888;
    margin: 1.5em 0;
    padding-left: 1em;
    border-left: 2px solid var(--main-color-1);
}
</style>
