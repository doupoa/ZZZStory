<template>
  <div class="drive-rating-app">
    <header>
      <h1>驱动盘评分</h1>
      <span>测试版本，欢迎反馈</span>
    </header>

    <!-- 模式切换 -->
    <template v-if="characters.length === 0">
      <div class="mode-tabs">
        <button
          v-for="mode in modes"
          :key="mode.id"
          @click="switchMode(mode.id)"
          :class="['mode-tab', { active: currentMode === mode.id }]"
        >
          {{ mode.name }}
        </button>
      </div>

      <!-- 上传模式选项卡 -->
      <!-- 自动提取模式 -->
      <AutoExtractTab
        v-if="currentMode === 'auto-new'"
        @switch-mode="switchMode"
        @data-received="handleDataReceived"
      />

      <!-- 上传文件模式 -->
      <UploadFileTab
        v-if="currentMode === 'auto-upload'"
        @switch-mode="switchMode"
        @data-received="handleDataReceived"
      />

      <!-- 手动填写模式 -->
      <ManualEntryTab
        v-if="currentMode === 'manual'"
        @switch-mode="switchMode"
      />
    </template>

    <!-- 评分结果展示 -->
    <transition name="fade">
      <ResultStep
        v-if="characters.length > 0"
        :characters="characters"
        :selected-character="selectedCharacter"
        :on-character-change="handleCharacterChange"
        @reset="handleReset"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { getAvataredCharacters } from "./character-avatar-map.ts";
import { getConfiguredCharacters } from "./rating_algorithm.ts";
import AutoExtractTab from "./Upload_Page_Tab/AutoExtractTab.vue";
import UploadFileTab from "./Upload_Page_Tab/UploadFileTab.vue";
import ManualEntryTab from "./Upload_Page_Tab/ManualEntryTab.vue";
import ResultStep from "./ResultStep.vue";
import { calculateCharacterTotalScore } from "./rating_algorithm.ts";

const currentMode = ref("auto-new");
const characters = ref([]);
const showCalculation = ref(false);
const selectedCharacter = ref("星见雅");
const allCharacterData = ref([]);

const modes = [
  { id: "auto-new", name: "自动提取（推荐）" },
  { id: "auto-upload", name: "上传文件" },
  { id: "manual", name: "手动填写" },
];

const switchMode = (mode) => {
  currentMode.value = mode;
  characters.value = [];
  showCalculation.value = false;
};

const handleDataReceived = (data) => {
  // 数据打包逻辑：按照 types.ts 定义进行转换
  const packedData = data.map((item) => {
    // 转换为 CharacterData 类型
    const characterData = {
      characterName: item.characterName || "",
      characterFullName: item.characterFullName || "",
      level: Number(item.level) || 0,
      profession: Number(item.profession) || 0,
      driveDiscs: (item.driveDiscs || []).map((disc) => {
        // 转换为 DriveDisc 类型
        return {
          position: Number(disc.position) || 0,
          name: disc.name || "",
          level: Number(disc.level) || 0,
          rarity: disc.rarity || "S",
          invalidProperty:
            Number(disc.invalidProperty || disc.invalid_property_cnt) || 0,
          mainProperty: {
            // 转换为 MainProperty 类型
            name:
              disc.mainProperty?.name || disc.mainProperty?.property_name || "",
            value: String(
              disc.mainProperty?.value || disc.mainProperty?.val || "",
            ),
          },
          subProperties: (disc.subProperties || []).map((sub) => {
            // 转换为 SubProperty 类型
            return {
              name: sub.name || sub.property_name || "",
              value: String(sub.value || sub.val || ""),
              level: Number(sub.level) || 0,
              valid: Boolean(sub.valid) || false,
              add: Number(sub.add) || 0,
            };
          }),
        };
      }),
    };
    return characterData;
  });

  allCharacterData.value = packedData;

  // 如果上传的数据不为空，选择第一个角色
  if (packedData.length > 0) {
    const firstCharacterName = packedData[0].characterName;
    selectedCharacter.value = firstCharacterName;
    switchCharacter(firstCharacterName);
  }
};

const availableCharacters = computed(() => {
  const configuredChars = getConfiguredCharacters();
  const avataredChars = getAvataredCharacters();

  return configuredChars.filter((char) => avataredChars.includes(char));
});

const switchCharacter = (characterName) => {
  const targetCharacter = allCharacterData.value.find(
    (c) => c.characterName === characterName,
  );

  if (!targetCharacter) {
    characters.value = [];
    return;
  }

  try {
    if (
      !targetCharacter.driveDiscs ||
      targetCharacter.driveDiscs.length === 0
    ) {
      characters.value = [
        {
          ...targetCharacter,
          totalScore: 0,
          averageScore: 0,
          discScores: {},
          discDetails: [],
        },
      ];
      return;
    }

    // 使用评分算法计算评分
    const result = calculateCharacterTotalScore(targetCharacter);

    // 计算平均分
    const totalDiscs = targetCharacter.driveDiscs.length;
    const averageScore = totalDiscs > 0 ? result.totalScore / totalDiscs : 0;

    // 确保所有6个位置都有数据
    const discDetails = [];
    const existingPositions = new Set(
      targetCharacter.driveDiscs.map((disc) => disc.position),
    );

    // 添加已装备的驱动盘
    result.discDetails.forEach((disc) => {
      discDetails.push({
        ...disc,
        details: {
          ...disc.details,
          validProperties: disc.details.validProperties || [],
        },
      });
    });

    // 添加未装备的驱动盘位置
    for (let i = 1; i <= 6; i++) {
      if (!existingPositions.has(i)) {
        discDetails.push({
          position: i,
          name: "未装备",
          level: 0,
          rarity: "-",
          mainProperty: { name: "无", value: 0 },
          score: 0,
          details: {
            score: 0,
            subPropertiesWeight: 0,
            mainPropertyWeight: 0,
            maxWeightSum: 0,
            maxWeightFormula: "",
            validProperties: [],
            qualityWeight: 0,
            levelWeight: 0,
          },
        });
      }
    }

    // 按位置排序
    discDetails.sort((a, b) => a.position - b.position);

    characters.value = [
      {
        ...targetCharacter,
        totalScore: result.totalScore,
        averageScore: Math.round(averageScore * 10) / 10, // 保留一位小数
        discScores: result.discScores,
        discDetails,
      },
    ];
  } catch (err) {
    console.error(`处理角色 "${characterName}" 时出错:`, err);
    characters.value = [];
  }
};

const handleCharacterChange = (event) => {
  const characterName = event.target.value;
  selectedCharacter.value = characterName;
  switchCharacter(characterName);
};

const handleReset = () => {
  // 重置状态
  characters.value = [];
  allCharacterData.value = [];
  selectedCharacter.value = "星见雅";
  // 切换回自动提取模式
  currentMode.value = "auto-new";
};
</script>

<style scoped>
.drive-rating-app {
  padding: 20px 0;
  min-height: 100vh;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--vp-c-text-1);
}

header span {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.mode-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--vp-c-divider);
  padding-bottom: 10px;
}

.mode-tab {
  padding: 10px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.mode-tab:hover {
  background: var(--vp-c-bg-soft);
  color: var(--main-color-1);
}

.mode-tab.active {
  background: var(--main-color-1);
  color: white;
  font-weight: 600;
}

.results-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.results-section h2 {
  font-size: 1.25rem;
  color: var(--main-color-1);
  margin: 0 0 20px 0;
}

.character-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.character-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.character-name-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.character-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.character-selector {
  display: flex;
  align-items: center;
}

.character-select {
  padding: 6px 12px;
  font-size: 0.875rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.character-select:hover {
  border-color: var(--main-color-1);
}

.character-select:focus {
  outline: none;
  border-color: var(--main-color-1);
  box-shadow: 0 0 0 2px var(--main-color-1);
}

.character-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--vp-c-divider);
}

.character-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--vp-c-divider);
  margin-right: 8px;
}

.character-score {
  text-align: right;
}

.no-data-message {
  text-align: center;
  padding: 40px 20px;
  color: var(--vp-c-text-2);
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-data-text {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--vp-c-text-1);
}

.no-data-hint {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.disc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.disc-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.disc-card:hover {
  border-color: var(--main-color-1);
  transform: translateY(-2px);
}

.disc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.disc-position {
  font-weight: 600;
  color: var(--main-color-1);
}

.disc-rarity {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 4px 8px;
  border-radius: 4px;
}

.disc-info {
  margin-bottom: 12px;
}

.disc-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.disc-level {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.disc-main-property {
  background: var(--vp-c-bg);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.disc-score {
  background: linear-gradient(135deg, var(--main-color-1), var(--main-color-2));
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.disc-properties {
  background: var(--vp-c-bg);
  padding: 12px;
  border-radius: 6px;
}

.property-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.property-item:last-child {
  border-bottom: none;
}

.property-name {
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
}

.property-value {
  font-size: 0.875rem;
  color: var(--main-color-1);
  font-weight: 600;
}

.calculation-section {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin-top: 20px;
  overflow: hidden;
}

.calculation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.2s ease;
}

.calculation-header:hover {
  background: var(--vp-c-divider);
}

.calculation-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--main-color-1);
}

.toggle-icon {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.calculation-content {
  padding: 20px;
}

.character-calculation {
  margin-bottom: 24px;
}

.character-calculation h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--main-color-1);
  display: flex;
  align-items: center;
}

.disc-calculation {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.disc-calc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--main-color-1), var(--main-color-2));
  color: white;
  font-weight: 600;
}

.disc-calc-header span {
  font-size: 0.875rem;
}

.disc-calc-header span:nth-child(2) {
  flex: 1;
  text-align: center;
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

.calc-row span:first-child {
  font-weight: 600;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
}

.calc-row span:last-child {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  font-family: "Consolas", "Monaco", monospace;
}

.calc-formula {
  background: rgba(238, 115, 9, 0.05);
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 8px;
}

.calc-formula span:last-child {
  color: var(--main-color-1);
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .disc-grid {
    grid-template-columns: 1fr;
  }

  .character-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .character-score {
    text-align: left;
  }

  .mode-tabs {
    flex-wrap: wrap;
  }

  .mode-tab {
    flex: 1;
    min-width: 120px;
  }
}
</style>
