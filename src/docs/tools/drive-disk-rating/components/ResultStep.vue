<template>
  <div class="card step-card step-2 full-width">
    <div class="step-header step-header-with-button">
      <div class="step-number">2</div>
      <h2 class="card-title">📊 评分结果</h2>
      <button @click="$emit('reset')" class="btn btn-secondary">
        🔄 重新上传
      </button>
    </div>
    
    <div class="character-list">
      <div v-for="character in characters" :key="character.characterName" class="character-card">
        <div class="character-header">
          <div class="character-name-wrapper">
            <h3 class="character-name">
              <img 
                :src="getCharacterAvatarUrl(character.characterName)" 
                :alt="character.characterName" 
                class="character-avatar"
              />
              {{ character.characterName }}
            </h3>
            <div class="character-selector">
              <select :value="selectedCharacter" @change="handleCharacterChange" class="character-select">
                <option 
                  v-for="char in availableCharacters" 
                  :key="char" 
                  :value="char"
                >
                  {{ char }}
                </option>
              </select>
            </div>
          </div>
          <div class="character-score">
            <div style="font-size: 0.875rem; color: var(--vp-c-text-2); margin-bottom: 4px;">总评分</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--main-color-1);">{{ character.totalScore.toFixed(1) }}</div>
            <div style="font-size: 0.75rem; color: var(--vp-c-text-2);">平均分: {{ character.averageScore.toFixed(1) }}</div>
          </div>
        </div>
        
        <div v-if="character.discDetails.length === 0" class="no-data-message">
          <div class="no-data-icon">📭</div>
          <div class="no-data-text">该角色暂无驱动盘数据</div>
          <div class="no-data-hint">请在游戏中为该角色装备驱动盘后重新提取数据</div>
        </div>
        
        <div v-else class="disc-grid">
          <div v-for="disc in character.discDetails" :key="disc.position" class="disc-card">
            <div class="disc-header">
              <span class="disc-position">位置 {{ disc.position }}</span>
              <span class="disc-rarity">{{ disc.rarity }}</span>
            </div>
            
            <div class="disc-info">
              <div class="disc-name">{{ disc.name }}</div>
              <div class="disc-level">等级 {{ disc.level }}</div>
            </div>
            
            <div class="disc-main-property">
              <strong>主属性：</strong>{{ disc.mainProperty?.name || '无' }} +{{ disc.mainProperty?.value || 0 }}
            </div>
            
            <div class="disc-score">
              <strong>评分：</strong>{{ disc.score.toFixed(1) }}
            </div>
            
            <div v-if="disc.details.gradeResult" class="disc-grade">
              <div
                class="inline-block mt-1.5 px-3 py-1 rounded font-bold text-2xl"
                :class="disc.details.gradeResult.gradeClass"
              >
                {{ disc.details.gradeResult.grade }}
              </div>
              <div class="text-base dark:text-gray-500 mt-1.5">
                {{ disc.details.gradeResult.gradeDesc }}
              </div>
            </div>
            
            <div class="disc-properties">
              <div style="font-weight: 600; color: var(--main-color-1); margin-bottom: 12px;">📊 有效副词条</div>
              <div v-for="(prop, index) in disc.details.validProperties" :key="index" class="property-item">
                <span class="property-name">{{ prop.name }}</span>
                <span class="property-value">{{ prop.value }} <small style="color: var(--vp-c-text-2);">+{{ prop.weightedValue.toFixed(2) }}</small></span>
              </div>
              <div v-if="!disc.details.validProperties.length" style="color: var(--vp-c-text-2); font-size: 0.875rem;">
                无有效副词条
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-if="characters.length" class="calculation-section">
    <div class="calculation-header" @click="toggleCalculation">
      <h2 class="calculation-title">🔢 计算过程详情</h2>
      <span class="toggle-icon">{{ showCalculation ? '收起 ▲' : '展开 ▼' }}</span>
    </div>
    
    <transition name="expand">
      <div v-if="showCalculation" class="calculation-content">
        <div v-for="character in characters" :key="character.characterName" class="character-calculation">
          <h3 class="character-calc-title">
            <img 
              :src="getCharacterAvatarUrl(character.characterName)" 
              :alt="character.characterName" 
              class="character-avatar"
            />
            {{ character.characterName }} 的计算过程
          </h3>
          
          <div v-for="disc in character.discDetails" :key="disc.position" class="disc-calculation">
            <div class="disc-calc-header">
              <span class="disc-calc-position">位置 {{ disc.position }}</span>
              <span class="disc-calc-name">{{ disc.name }}</span>
              <span class="disc-calc-score">最终评分: {{ disc.score.toFixed(2) }}</span>
            </div>
            
            <div class="disc-calc-details">
              <div class="calc-row">
                <span class="calc-label">品质权重:</span>
                <span class="calc-value">{{ disc.details.qualityWeight.toFixed(2) }} ({{ disc.rarity }}级)</span>
              </div>
              <div class="calc-row">
                <span class="calc-label">等级权重:</span>
                <span class="calc-value">{{ disc.details.levelWeight.toFixed(2) }} ({{ disc.level }}级)</span>
              </div>
              <div class="calc-row collapsible-row">
                <span class="calc-label">副词条权重总和:</span>
                <span class="calc-value-with-toggle">
                  <span class="calc-value">{{ disc.details.subPropertiesWeight.toFixed(4) }}</span>
                  <span class="collapse-toggle" @click="disc.showSubDetails = !disc.showSubDetails">
                    {{ disc.showSubDetails ? '▼' : '▶' }}
                  </span>
                </span>
              </div>
              <div v-if="disc.showSubDetails && disc.details.validProperties.length > 0" class="valid-properties-section">
                <div v-for="(prop, index) in disc.details.validProperties" :key="index" class="valid-prop-item">
                  <span class="prop-name">{{ prop.name }} {{ prop.value }} +{{ prop.add }}</span>
                  <span class="prop-weight">权重: {{ prop.weight.toFixed(2) }}</span>
                  <span class="prop-contribution">贡献: {{ prop.weightedValue.toFixed(4) }}</span>
                </div>
              </div>
              <div class="calc-row">
                <span class="calc-label">主属性权重:</span>
                <span class="calc-value">{{ disc.details.mainPropertyWeight.toFixed(4) }}</span>
              </div>
              <div class="calc-row collapsible-row">
                <span class="calc-label">最大权重总和:</span>
                <span class="calc-value-with-toggle">
                  <span class="calc-value">{{ disc.details.maxWeightInfo.maxWeightSum.toFixed(4) }}</span>
                  <span class="collapse-toggle" @click="disc.showMaxWeightDetails = !disc.showMaxWeightDetails">
                    {{ disc.showMaxWeightDetails ? '▼' : '▶' }}
                  </span>
                </span>
              </div>
              <div v-if="disc.showMaxWeightDetails" class="max-weight-details">
                <div class="max-weight-formula">
                  最理想的情况: {{ disc.details.maxWeightInfo.maxWeightFormula || '计算中...' }}
                </div>
              </div>
              <div class="calc-row calc-formula">
                <span class="calc-label">计算公式:</span>
                <span class="calc-value">
                  ({{ disc.details.subPropertiesWeight.toFixed(4) }} + {{ disc.details.mainPropertyWeight.toFixed(4) }}) 
                  × (55 ÷ {{ disc.details.maxWeightInfo.maxWeightSum.toFixed(4) }}) 
                  × {{ disc.details.qualityWeight.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'
import { getCharacterAvatarUrl, getAvataredCharacters } from './character-avatar-map.ts'
import { getConfiguredCharacters } from 'zzz-drive-disk-rating'

interface Character {
  characterName: string
  characterFullName: string
  level: number
  profession: number
  driveDiscs: any[]
  totalScore: number
  averageScore: number
  discScores: { [position: number]: number }
  discDetails: any[]
}

defineProps<{
  characters: Character[]
  selectedCharacter: string
  onCharacterChange: (characterName: string) => void
}>()

defineEmits<{
  (e: 'reset'): void
}>()

const showCalculation = ref(false)

const availableCharacters = computed(() => {
  const configuredChars = getConfiguredCharacters()
  const avataredChars = getAvataredCharacters()
  return configuredChars.filter(char => avataredChars.includes(char))
})

const toggleCalculation = () => {
  showCalculation.value = !showCalculation.value
}

const handleCharacterChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const characterName = target.value
  getCurrentInstance()?.emit('onCharacterChange', characterName)
}
</script>

<style scoped>
.step-card.step-2 {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.step-header-with-button {
  justify-content: space-between;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #c8e700, #ee7309);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: white;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.btn-secondary {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}

.character-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.character-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 24px;
}

.character-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.character-name {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.character-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.character-selector {
  display: flex;
  align-items: center;
}

.character-select {
  padding: 8px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.character-select:hover {
  border-color: var(--vp-c-brand-1);
}

.character-score {
  text-align: right;
}

.no-data-message {
  text-align: center;
  padding: 40px;
  color: var(--vp-c-text-2);
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.no-data-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.no-data-hint {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.disc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.disc-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.disc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.disc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.disc-position {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  font-size: 1rem;
}

.disc-rarity {
  font-weight: 600;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.disc-info {
  margin-bottom: 12px;
}

.disc-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  margin-bottom: 4px;
}

.disc-level {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.disc-main-property {
  background: rgba(238, 115, 9, 0.1);
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
}

.disc-score {
  background: linear-gradient(135deg, rgba(200, 231, 0, 0.2), rgba(238, 115, 9, 0.2));
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-align: center;
}

.disc-grade {
  background: var(--vp-c-bg);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}

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

.disc-properties {
  background: var(--vp-c-bg);
  padding: 16px;
  border-radius: 8px;
}

.property-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.property-item:last-child {
  border-bottom: none;
}

.property-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
}

.property-value {
  font-family: 'Consolas', 'Monaco', monospace;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.calculation-section {
  margin-top: 30px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.calculation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.calculation-header:hover {
  background: var(--vp-c-bg);
}

.calculation-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.toggle-icon {
  font-size: 0.875rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.calculation-content {
  padding: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.character-calculation {
  margin-bottom: 30px;
}

.character-calc-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 20px 0;
}

.disc-calculation {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.disc-calc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.disc-calc-position {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  font-size: 1.1rem;
}

.disc-calc-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
  font-size: 1rem;
}

.disc-calc-score {
  font-weight: 700;
  color: var(--vp-c-brand-1);
  font-size: 1.2rem;
}

.disc-calc-details {
  padding: 20px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.calc-row:last-child {
  border-bottom: none;
}

.calc-row.collapsible-row {
  cursor: pointer;
}

.calc-row.collapsible-row:hover {
  background: rgba(238, 115, 9, 0.05);
}

.calc-label {
  font-weight: 600;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.calc-value {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  font-family: 'Consolas', 'Monaco', monospace;
}

.calc-value-with-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
}

.collapse-toggle {
  font-size: 0.7rem;
  color: var(--vp-c-brand-1);
  transition: transform 0.2s;
  cursor: pointer;
}

.collapse-toggle:hover {
  color: var(--vp-c-brand-2);
}

.valid-properties-section {
  padding: 12px 16px;
  background: rgba(238, 115, 9, 0.05);
  border-left: 3px solid var(--vp-c-brand-1);
  margin: 8px 0;
}

.valid-prop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 0.85rem;
}

.prop-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.prop-weight {
  color: var(--vp-c-brand-1);
  font-family: 'Consolas', 'Monaco', monospace;
}

.prop-contribution {
  color: var(--vp-c-text-2);
  font-family: 'Consolas', 'Monaco', monospace;
}

.max-weight-details {
  padding: 12px 16px;
  background: rgba(238, 115, 9, 0.05);
  border-left: 3px solid var(--vp-c-brand-1);
  margin: 8px 0;
}

.max-weight-formula {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  word-break: break-all;
}

.calc-formula {
  background: rgba(238, 115, 9, 0.05);
  padding: 12px 16px;
  margin-top: 8px;
  border-radius: 8px;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>
