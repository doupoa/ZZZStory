<template>
  <div class="drive-rating-app">
    <header>
      <h1>驱动盘评分</h1>
      <span>测试版本，欢迎反馈</span>
    </header>

    <!-- 模式切换 -->
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

    <!-- 手动填写模式 -->
    <transition name="fade">
      <ManualEntry
        v-if="currentMode === 'manual'"
        @switch-to-auto="switchMode('auto-new')"
      />
    </transition>

    <!-- 自动上传模式（书签脚本） -->
    <transition name="fade">
      <div v-if="currentMode === 'auto-upload'" class="auto-upload-section">
        <div class="card">
          <h2>📁 上传驱动盘数据</h2>

          <div
            class="upload-area"
            :class="{ dragover: isDragover }"
            @click="triggerFileInput"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <div class="upload-icon">📂</div>
            <p class="upload-text">点击选择文件或拖拽文件到此处</p>
            <p class="upload-hint">支持 JSON 格式文件</p>
          </div>

          <input
            type="file"
            id="fileInput"
            class="file-input"
            accept=".json"
            @change="handleFileSelect"
          />

          <div v-if="fileInfo" class="file-info">
            <div style="display: flex; align-items: center; gap: 12px">
              <span style="font-size: 2rem">📄</span>
              <div>
                <div
                  style="
                    font-weight: 600;
                    color: var(--vp-c-text-1);
                    margin-bottom: 4px;
                  "
                >
                  {{ fileInfo.name }}
                </div>
                <div style="font-size: 0.875rem; color: var(--vp-c-text-2)">
                  文件大小：{{ (fileInfo.size / 1024).toFixed(2) }} KB
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="error-message">
            <strong>❌ 错误：</strong>{{ error }}
          </div>

          <div v-if="isLoading" class="loading">
            <div class="spinner"></div>
            <p>正在计算评分...</p>
          </div>

          <div class="bookmarklet-section">
            <h3>🚀 一键提取驱动盘数据</h3>
            <p class="bookmarklet-desc">
              使用书签脚本，在官方页面一键提取驱动盘数据
            </p>

            <div class="bookmarklet-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <strong>访问官方页面</strong>
                <p>点击下方按钮打开绝区零角色练度页面，并确保您已登录账号。</p>
                <a
                  href="https://act.mihoyo.com/zzz/gt/character-builder-h/index.html#/"
                  target="_blank"
                  class="btn"
                >
                  打开角色练度页面 ↗
                </a>
              </div>
            </div>

            <div class="bookmarklet-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <strong>添加书签脚本</strong>
                <p>将下方的按钮拖拽到浏览器的书签栏中。</p>
                <a
                  href="javascript:(async function(){const API_BASE='https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool';const API_LOGIN='https://api-takumi.mihoyo.com/common/badge/v1/login/info';const cleanText=t=>t?.replace(/<[^>]*>/g,'').replace(/\\n/g,'')||'';const fetchJSON=(t,e)=>fetch(t,{credentials:'include',...e}).then(t=>t.json());const getGameUID=async()=>(await fetchJSON(`${API_LOGIN}?game_biz=nap_cn&lang=zh-cn`)).data?.game_uid;const getDeviceFP=()=>document.cookie.match(/DEVICEFP=(\\w+)/)?.[1];const getBasicList=(t,e)=>fetchJSON(`${API_BASE}/user/avatar_basic_list?uid=${t}&region=prod_gf_cn`,{headers:{'x-rpc-device_fp':e}});const getEquipBatch=(t,e,o)=>fetchJSON(`${API_BASE}/user/batch_avatar_detail_v2?uid=${t}&region=prod_gf_cn`,{method:'POST',headers:{'x-rpc-device_fp':o},body:JSON.stringify({avatar_list:e})});const processEquipData=({avatar:t,equip:e,weapon:o})=>({characterName:t.name_mi18n,characterFullName:t.full_name_mi18n,level:t.level,profession:t.avatar_profession,driveDiscs:e?.map(({level:t,name:e,icon:o,rarity:a,invalid_property_cnt:i,equipment_type:s,properties:r,main_properties:n,equip_suit:c})=>({position:s,name:e,level:t,rarity:a,invalidProperty:i,mainProperty:{name:n[0].property_name,val:n[0].base},subProperties:r.map(({property_name:t,base:e,level:o,valid:a,add:i})=>({name:t,val:e,level:o,valid:a,add:i})),suit:{name:c.name,desc1:c.desc1,desc2:cleanText(c.desc2)}}))||[]});const uid=await getGameUID();const device_fp=getDeviceFP();if(!uid||!device_fp){alert('❌ 无法读取 UID 或 DEVICEFP，可能未登录！');return;}const basicData=await getBasicList(uid,device_fp);const avatarList=basicData.data.list.filter(t=>t.unlocked).map(t=>({avatar_id:t.avatar.id}));const batches=[];for(let t=0;t<avatarList.length;t+=10)batches.push(avatarList.slice(t,t+10));const detailResponses=await Promise.all(batches.map(t=>getEquipBatch(uid,t,device_fp)));const allResults=detailResponses.flatMap(t=>t.data.list.map(processEquipData));const result=allResults.map(t=>({...t,driveDiscs:t.driveDiscs.map(d=>({...d,mainProperty:{name:d.mainProperty.name,value:d.mainProperty.val.toString()},subProperties:d.subProperties.map(s=>({...s,value:s.val.toString()}))}))}));const dataStr=JSON.stringify(result,null,2);const blob=new Blob([dataStr],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='drive_discs_data.json';a.click();URL.revokeObjectURL(url);alert(`✅ 成功提取 ${result.length} 个角色的驱动盘数据！`);})();"
                  class="bookmarklet-btn"
                  rel="noopener noreferrer"
                >
                  🎮 一键提取驱动盘
                </a>
                <p class="hint">
                  💡 提示：如果看不到书签栏，按
                  <code>Ctrl+Shift+B</code> (Windows) 或
                  <code>Cmd+Shift+B</code> (Mac) 显示
                </p>
              </div>
            </div>

            <div class="bookmarklet-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <strong>一键提取数据</strong>
                <p>
                  在官方页面点击书签栏中的按钮，脚本将自动提取所有角色的驱动盘数据并下载为
                  JSON 文件。
                </p>
              </div>
            </div>
          </div>

          <!-- 切换提示 -->
          <div class="switch-hint">
            <button @click="switchMode('manual')" class="switch-btn">
              ✏️ 无法获取数据？试试手动填写
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 新自动模式（window.open + postMessage） -->
    <transition name="fade">
      <div v-if="currentMode === 'auto-new'" class="auto-new-section">
        <div class="card">
          <h2>🚀 自动提取驱动盘数据</h2>
          <p class="description">
            使用书签脚本，在官方页面一键提取数据并自动传输
          </p>

          <div class="bookmarklet-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <strong>访问官方页面</strong>
              <p>点击下方按钮打开绝区零角色练度页面，并确保您已登录账号。</p>
              <a
                href="https://act.mihoyo.com/zzz/gt/character-builder-h/index.html#/"
                target="_blank"
                class="btn"
              >
                打开角色练度页面 ↗
              </a>
            </div>
          </div>

          <div class="bookmarklet-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <strong>添加书签脚本</strong>
              <p>将下方的按钮拖拽到浏览器的书签栏中。</p>
              <a
                href="javascript:(async function(){const API_BASE='https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool';const API_LOGIN='https://api-takumi.mihoyo.com/common/badge/v1/login/info';const cleanText=t=>t?.replace(/<[^>]*>/g,'').replace(/\\n/g,'')||'';const fetchJSON=(t,e)=>fetch(t,{credentials:'include',...e}).then(t=>t.json());const getGameUID=async()=>(await fetchJSON(`${API_LOGIN}?game_biz=nap_cn&lang=zh-cn`)).data?.game_uid;const getDeviceFP=()=>document.cookie.match(/DEVICEFP=(\\w+)/)?.[1];const getBasicList=(t,e)=>fetchJSON(`${API_BASE}/user/avatar_basic_list?uid=${t}&region=prod_gf_cn`,{headers:{'x-rpc-device_fp':e}});const getEquipBatch=(t,e,o)=>fetchJSON(`${API_BASE}/user/batch_avatar_detail_v2?uid=${t}&region=prod_gf_cn`,{method:'POST',headers:{'x-rpc-device_fp':o},body:JSON.stringify({avatar_list:e})});const processEquipData=({avatar:t,equip:e,weapon:o})=>({characterName:t.name_mi18n,characterFullName:t.full_name_mi18n,level:t.level,profession:t.avatar_profession,driveDiscs:e?.map(({level:t,name:e,icon:o,rarity:a,invalid_property_cnt:i,equipment_type:s,properties:r,main_properties:n,equip_suit:c})=>({position:s,name:e,level:t,rarity:a,invalidProperty:i,mainProperty:{name:n[0].property_name,val:n[0].base},subProperties:r.map(({property_name:t,base:e,level:o,valid:a,add:i})=>({name:t,val:e,level:o,valid:a,add:i})),suit:{name:c.name,desc1:c.desc1,desc2:cleanText(c.desc2)}}))||[]});const uid=await getGameUID();const device_fp=getDeviceFP();if(!uid||!device_fp){alert('❌ 无法读取 UID 或 DEVICEFP，可能未登录！');return;}const basicData=await getBasicList(uid,device_fp);const avatarList=basicData.data.list.filter(t=>t.unlocked).map(t=>({avatar_id:t.avatar.id}));const batches=[];for(let t=0;t<avatarList.length;t+=10)batches.push(avatarList.slice(t,t+10));const detailResponses=await Promise.all(batches.map(t=>getEquipBatch(uid,t,device_fp)));const allResults=detailResponses.flatMap(t=>t.data.list.map(processEquipData));const result=allResults.map(t=>({...t,driveDiscs:t.driveDiscs.map(d=>({...d,mainProperty:{name:d.mainProperty.name,value:d.mainProperty.val.toString()},subProperties:d.subProperties.map(s=>({...s,value:s.val.toString()}))}))}));const ANALYZER_URL='https://zzzstory.doupoa.site/tools/drive-disk-rating/';const popup=window.open(ANALYZER_URL,'_blank');if(!popup){alert('请允许弹出窗口，否则无法打开分析器！');return;}setTimeout(()=>{try{popup.postMessage({type:'ZZZ_CHARACTER_DATA',payload:result},window.location.origin);console.log('角色数据已发送至分析器');}catch(e){console.error('发送失败:',e);alert('数据发送失败，请重试');}},1500);})();"
                class="bookmarklet-btn"
                rel="noopener noreferrer"
              >
                🎮 一键提取并传输
              </a>
              <p class="hint">
                💡 提示：如果看不到书签栏，按
                <code>Ctrl+Shift+B</code> (Windows) 或
                <code>Cmd+Shift+B</code> (Mac) 显示
              </p>
            </div>
          </div>

          <div class="bookmarklet-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <strong>提取数据</strong>
              <p>
                在官方页面点击书签栏中的按钮，脚本将自动提取数据并传输到本页面。
              </p>
            </div>
          </div>

          <!-- 接收状态 -->
          <div
            v-if="receivingStatus"
            :class="['status-box', receivingStatus.type]"
          >
            <div class="status-icon">{{ receivingStatus.icon }}</div>
            <div class="status-text">{{ receivingStatus.text }}</div>
          </div>

          <!-- 切换提示 -->
          <div class="switch-hint">
            <button @click="switchMode('manual')" class="switch-btn">
              ✏️ 无法获取数据？试试手动填写
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 评分结果展示 -->
    <transition name="fade">
      <div v-if="characters.length > 0" class="results-section">
        <h2>📊 评分结果</h2>

        <div class="character-list">
          <div
            v-for="character in characters"
            :key="character.characterName"
            class="character-card"
          >
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
                  <select
                    :value="selectedCharacter"
                    @change="handleCharacterChange"
                    class="character-select"
                  >
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
                <div style="font-size: 0.875rem; color: var(--vp-c-text-2)">
                  总评分
                </div>
                <div
                  style="
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--main-color-1);
                  "
                >
                  {{ character.totalScore.toFixed(1) }}
                </div>
                <div style="font-size: 0.75rem; color: var(--vp-c-text-2)">
                  平均分: {{ character.averageScore.toFixed(1) }}
                </div>
              </div>
            </div>

            <div
              v-if="character.discDetails.length === 0"
              class="no-data-message"
            >
              <div class="no-data-icon">📭</div>
              <div class="no-data-text">该角色暂无驱动盘数据</div>
              <div class="no-data-hint">
                请在游戏中为该角色装备驱动盘后重新提取数据
              </div>
            </div>

            <div v-else class="disc-grid">
              <div
                v-for="disc in character.discDetails"
                :key="disc.position"
                class="disc-card"
              >
                <div class="disc-header">
                  <span class="disc-position">位置 {{ disc.position }}</span>
                  <span class="disc-rarity">{{ disc.rarity }}</span>
                </div>

                <div class="disc-info">
                  <div class="disc-name">{{ disc.name }}</div>
                  <div class="disc-level">等级 {{ disc.level }}</div>
                </div>

                <div class="disc-main-property">
                  <strong>主属性：</strong
                  >{{ disc.mainProperty?.name || "无" }} +{{
                    disc.mainProperty?.value || 0
                  }}
                </div>

                <div class="disc-score">
                  <strong>评分：</strong>{{ disc.score.toFixed(1) }}
                </div>

                <div class="disc-properties">
                  <div
                    style="
                      font-weight: 600;
                      color: var(--main-color-1);
                      margin-bottom: 12px;
                    "
                  >
                    📊 有效副词条
                  </div>
                  <div
                    v-for="(prop, index) in disc.details.validProperties"
                    :key="index"
                    class="property-item"
                  >
                    <span class="property-name">{{ prop.name }}</span>
                    <span class="property-value"
                      >{{ prop.value }}
                      <small style="color: var(--vp-c-text-2)"
                        >+{{ prop.weightedValue.toFixed(2) }}</small
                      ></span
                    >
                  </div>
                  <div
                    v-if="!disc.details.validProperties.length"
                    style="color: var(--vp-c-text-2); font-size: 0.875rem"
                  >
                    无有效副词条
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 计算过程详情 -->
        <div v-if="showCalculation" class="calculation-section">
          <div class="calculation-header" @click="toggleCalculation">
            <h3>🔢 计算过程详情</h3>
            <span class="toggle-icon">{{
              showCalculation ? "收起 ▲" : "展开 ▼"
            }}</span>
          </div>

          <div v-if="showCalculation" class="calculation-content">
            <div
              v-for="character in characters"
              :key="character.characterName"
              class="character-calculation"
            >
              <h4>
                <img
                  :src="getCharacterAvatarUrl(character.characterName)"
                  :alt="character.characterName"
                  class="character-avatar-small"
                />
                {{ character.characterName }} 的计算过程
              </h4>

              <div
                v-for="disc in character.discDetails"
                :key="disc.position"
                class="disc-calculation"
              >
                <div class="disc-calc-header">
                  <span>位置 {{ disc.position }}</span>
                  <span>{{ disc.name }}</span>
                  <span>最终评分: {{ disc.score.toFixed(2) }}</span>
                </div>

                <div class="disc-calc-details">
                  <div class="calc-row">
                    <span>品质权重:</span>
                    <span
                      >{{ disc.details.qualityWeight.toFixed(2) }} ({{
                        disc.rarity
                      }}级)</span
                    >
                  </div>
                  <div class="calc-row">
                    <span>等级权重:</span>
                    <span
                      >{{ disc.details.levelWeight.toFixed(2) }} ({{
                        disc.level
                      }}级)</span
                    >
                  </div>
                  <div class="calc-row">
                    <span>副词条权重总和:</span>
                    <span>{{
                      disc.details.subPropertiesWeight.toFixed(4)
                    }}</span>
                  </div>
                  <div class="calc-row">
                    <span>主属性权重:</span>
                    <span>{{
                      disc.details.mainPropertyWeight.toFixed(4)
                    }}</span>
                  </div>
                  <div class="calc-row">
                    <span>最大权重总和:</span>
                    <span>{{ disc.details.maxWeightSum.toFixed(4) }}</span>
                  </div>
                  <div class="calc-row calc-formula">
                    <span>计算公式:</span>
                    <span>
                      ({{ disc.details.subPropertiesWeight.toFixed(4) }} +
                      {{ disc.details.mainPropertyWeight.toFixed(4) }}) × (55 ÷
                      {{ disc.details.maxWeightSum.toFixed(4) }}) ×
                      {{ disc.details.qualityWeight.toFixed(2) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  getCharacterAvatarUrl,
  getAvataredCharacters,
} from "./character-avatar-map.ts";
import {
  getCharacterWeights,
  getConfiguredCharacters,
} from "./character-weights.ts";
import ManualEntry from "./ManualEntry.vue";

const currentMode = ref("auto-new");
const receivingStatus = ref(null);
const characters = ref([]);
const showCalculation = ref(false);
const selectedCharacter = ref("星见雅");
const allCharacterData = ref([]);

const modes = [
  { id: "auto-new", name: "🚀 自动提取（推荐）" },
  { id: "auto-upload", name: "📁 上传文件" },
  { id: "manual", name: "✏️ 手动填写" },
];

const toggleCalculation = () => {
  showCalculation.value = !showCalculation.value;
};

const switchMode = (mode) => {
  currentMode.value = mode;
  characters.value = [];
  error.value = null;
  fileInfo.value = null;
  showCalculation.value = false;
};

// PostMessage 处理
const handleMessage = (event) => {
  // 安全检查：验证消息来源
  const allowedOrigins = [
    "https://act.mihoyo.com",
    "https://zzzstory.doupoa.site",
  ];
  if (!allowedOrigins.includes(event.origin)) {
    console.warn("拒绝非信任来源的消息:", event.origin);
    return;
  }

  // 验证消息格式
  if (event.data?.type === "ZZZ_CHARACTER_DATA" && event.data?.payload) {
    try {
      const data = event.data.payload;

      if (!Array.isArray(data)) {
        throw new Error("数据格式错误：应为数组");
      }

      // 保存所有角色数据
      allCharacterData.value = data;

      // 显示选中的角色
      switchCharacter(selectedCharacter.value);

      receivingStatus.value = {
        type: "success",
        icon: "✅",
        text: `成功接收 ${data.length} 个角色的数据！`,
      };

      // 3秒后清除状态
      setTimeout(() => {
        receivingStatus.value = null;
      }, 3000);
    } catch (e) {
      receivingStatus.value = {
        type: "error",
        icon: "❌",
        text: "数据解析失败：" + e.message,
      };
      console.error("PostMessage 数据解析失败:", e);
    }
  }
};

onMounted(() => {
  window.addEventListener("message", handleMessage);
  receivingStatus.value = {
    type: "info",
    icon: "⏳",
    text: "等待接收数据...请在官方页面点击书签按钮",
  };
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
});

// 文件上传相关
const isDragover = ref(false);
const fileInfo = ref(null);
const error = ref(null);
const isLoading = ref(false);

const triggerFileInput = () => {
  document.getElementById("fileInput").click();
};

const handleDragOver = () => {
  isDragover.value = true;
};

const handleDragLeave = () => {
  isDragover.value = false;
};

const handleDrop = (e) => {
  isDragover.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
};

const handleFileSelect = (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
};

const processFile = async (file) => {
  if (!file.name.endsWith(".json")) {
    error.value = "请上传 JSON 格式文件";
    return;
  }

  isLoading.value = true;
  error.value = null;
  fileInfo.value = {
    name: file.name,
    size: file.size,
  };

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data)) {
      error.value = "JSON 数据格式错误：应为数组";
      return;
    }

    allCharacterData.value = data;
    switchCharacter(selectedCharacter.value);
  } catch (err) {
    error.value = "文件解析失败：" + err.message;
  } finally {
    isLoading.value = false;
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
    error.value = `未找到角色 "${characterName}" 的数据`;
    characters.value = [];
    return;
  }

  error.value = null;

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

    const allDiscs = targetCharacter.driveDiscs;
    const result = calculateCharacterTotalScore(targetCharacter);
    characters.value = [
      {
        ...targetCharacter,
        ...result,
      },
    ];
  } catch (err) {
    console.error(`处理角色 "${characterName}" 时出错:`, err);
    error.value = `处理角色 "${characterName}" 时出错: ${err.message}`;
    characters.value = [];
  }
};

const handleCharacterChange = (event) => {
  const characterName = event.target.value;
  selectedCharacter.value = characterName;
  switchCharacter(characterName);
};

// 评分算法（从 rating_algorithm.ts 复制）
function calculateDriveDiscScore(driveDisc, roleName = "default") {
  if (!driveDisc || typeof driveDisc !== "object") {
    return {
      score: 0,
      subPropertiesWeight: 0,
      mainPropertyWeight: 0,
      maxWeightSum: 0,
      validProperties: [],
      qualityWeight: 0,
      levelWeight: 0,
    };
  }

  const weights = getCharacterWeights(roleName);

  const rarity = driveDisc.rarity || "S";
  const qualityWeight =
    {
      S: 1,
      A: 0.67,
      B: 0.33,
    }[rarity] || 1;

  const level = driveDisc.level || 0;
  const levelWeight = Math.min(0.25 + level * 0.05, 1);

  const subProperties = Array.isArray(driveDisc.subProperties)
    ? driveDisc.subProperties
    : [];
  const validSubProperties = subProperties.filter((prop) => {
    let propertyName = prop.name;

    if (
      !prop.value.includes("%") &&
      ["生命值", "攻击力", "防御力"].includes(prop.name)
    ) {
      if (prop.name === "攻击力") {
        propertyName = "小攻击";
      } else if (prop.name === "生命值") {
        propertyName = "小生命";
      } else if (prop.name === "防御力") {
        propertyName = "小防御";
      }
    }

    const weight = weights[propertyName] || 0;
    return weight > 0;
  });

  let subPropertiesWeight = 0;
  const validProperties = [];

  validSubProperties.forEach((prop) => {
    let propertyName = prop.name;

    if (
      !prop.value.includes("%") &&
      ["生命值", "攻击力", "防御力"].includes(prop.name)
    ) {
      if (prop.name === "攻击力") {
        propertyName = "小攻击";
      } else if (prop.name === "生命值") {
        propertyName = "小生命";
      } else if (prop.name === "防御力") {
        propertyName = "小防御";
      }
    }

    const weight = weights[propertyName] || 0;
    const addValue = prop.add || 0;
    const weightedValue = weight + addValue * weight;
    subPropertiesWeight += weightedValue;

    validProperties.push({
      name: prop.name,
      value: prop.value,
      weight: weight,
      level: prop.level,
      weightedValue: weightedValue,
    });
  });

  const position =
    typeof driveDisc.position === "number" ? driveDisc.position : 1;
  const mainProperty = driveDisc.mainProperty || { name: "", value: "" };

  let mainPropertyWeight = 0;
  if (position >= 4 && position <= 6) {
    const mainPropWeight = weights[mainProperty.name] || 0;
    mainPropertyWeight = 3 * mainPropWeight * levelWeight;
  }

  const excludeKeywords = ["伤害加成", "异常掌控", "穿透率", "能量自动回复"];
  const validWeights = Object.entries(weights)
    .filter(
      ([name]) => !excludeKeywords.some((keyword) => name.includes(keyword)),
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([_, weight]) => weight);

  const first = validWeights[0] || 0;
  const second = validWeights[1] || 0;
  const third = validWeights[2] || 0;
  const fourth = validWeights[3] || 0;
  const subPropertyMax = 6 * first + 1 * second + 1 * third + 1 * fourth;

  const mainPropertyName = mainProperty.name;
  const mainPropWeight = weights[mainPropertyName] || 0;

  let mainPropertyMax = 0;
  if (position >= 4 && position <= 6) {
    if (mainPropWeight === 0) {
      mainPropertyMax = 2;
    } else {
      mainPropertyMax = 3 * mainPropWeight;
    }
  }

  const maxWeightSum = subPropertyMax + mainPropertyMax;
  const scorePerWeight = 55 / maxWeightSum;
  const actualScore =
    (subPropertiesWeight + mainPropertyWeight) * scorePerWeight * qualityWeight;

  return {
    score: Math.round(actualScore * 10) / 10,
    subPropertiesWeight,
    mainPropertyWeight,
    maxWeightSum,
    validProperties,
    qualityWeight,
    levelWeight,
  };
}

function calculateCharacterTotalScore(characterData) {
  const discScores = {};
  const discDetails = [];

  for (let i = 1; i <= 6; i++) {
    discScores[i] = 0;
  }

  let totalScore = 0;
  let discCount = 0;

  for (const driveDisc of characterData.driveDiscs) {
    const result = calculateDriveDiscScore(
      driveDisc,
      characterData.characterName,
    );
    discScores[driveDisc.position] = result.score;
    totalScore += result.score;
    discCount++;

    discDetails.push({
      position: driveDisc.position,
      name: driveDisc.name,
      level: driveDisc.level,
      rarity: driveDisc.rarity,
      mainProperty: driveDisc.mainProperty || { name: "无", value: 0 },
      score: result.score,
      details: result,
    });
  }

  for (let i = 1; i <= 6; i++) {
    if (!characterData.driveDiscs.some((disc) => disc.position === i)) {
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
          validProperties: [],
          qualityWeight: 0,
          levelWeight: 0,
        },
      });
    }
  }

  discDetails.sort((a, b) => a.position - b.position);

  const averageScore = discCount > 0 ? totalScore / discCount : 0;

  return {
    totalScore: Math.round(totalScore * 10) / 10,
    averageScore: Math.round(averageScore * 10) / 10,
    discScores,
    discDetails,
  };
}
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

/* 模式切换 */
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

/* 卡片样式 */
.card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.card h2 {
  font-size: 1.25rem;
  color: var(--main-color-1);
  margin: 0 0 16px 0;
}

.card .description {
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed var(--vp-c-divider);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--vp-c-bg);
}

.upload-area:hover {
  border-color: var(--main-color-1);
  background: rgba(238, 115, 9, 0.05);
}

.upload-area.dragover {
  border-color: var(--main-color-1);
  background: rgba(238, 115, 9, 0.1);
  transform: scale(1.02);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--vp-c-text-1);
}

.upload-hint {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.file-input {
  display: none;
}

.file-info {
  background: var(--vp-c-success-soft);
  border: 1px solid var(--vp-c-success-1);
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
}

.error-message {
  background: var(--vp-c-danger-soft);
  border: 1px solid var(--vp-c-danger-1);
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
  color: var(--vp-c-danger-1);
}

.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--vp-c-divider);
  border-top: 4px solid var(--main-color-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 书签脚本区域 */
.bookmarklet-section {
  margin-top: 20px;
}

.bookmarklet-section h3 {
  font-size: 1.125rem;
  color: var(--main-color-1);
  margin: 0 0 12px 0;
}

.bookmarklet-desc {
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
}

.bookmarklet-step {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.step-number {
  width: 36px;
  height: 36px;
  background: var(--main-color-1);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content strong {
  display: block;
  font-size: 1rem;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.step-content p {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 12px;
}

.step-content .highlight {
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.btn {
  display: inline-block;
  padding: 8px 16px;
  background: var(--main-color-1);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  margin: 8px 0;
  transition: all 0.2s ease;
}

.btn:hover {
  background: var(--main-color-2);
  transform: translateY(-2px);
}

.bookmarklet-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 12px 24px;
  font-size: 1rem;
  white-space: nowrap;
  display: inline-block;
}

.bookmarklet-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.hint {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-top: 12px;
}

.hint code {
  background: var(--vp-c-bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.875rem;
}

/* 状态框 */
.status-box {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-box.success {
  border-color: var(--vp-c-success-1);
  background: var(--vp-c-success-soft);
}

.status-box.error {
  border-color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
}

.status-box.info {
  border-color: var(--vp-c-info-1);
  background: var(--vp-c-info-soft);
}

.status-icon {
  font-size: 2rem;
}

.status-text {
  flex: 1;
  color: var(--vp-c-text-1);
}

/* 切换提示 */
.switch-hint {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
}

.switch-btn {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.switch-btn:hover {
  background: var(--vp-c-divider);
  border-color: var(--main-color-1);
  color: var(--main-color-1);
}

/* 结果区域 */
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
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: var(--vp-c-success-1);
}

.disc-score {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--main-color-1);
  margin-bottom: 12px;
}

.disc-properties {
  background: var(--vp-c-bg);
  padding: 12px;
  border-radius: 4px;
}

.property-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.property-item:last-child {
  border-bottom: none;
}

.property-name {
  color: var(--vp-c-text-1);
}

.property-value {
  color: var(--vp-c-success-1);
  font-weight: 600;
}

/* 计算过程详情 */
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
  transition: all 0.3s ease;
}

.calculation-header:hover {
  background: var(--vp-c-bg-soft);
}

.calculation-header h3 {
  font-size: 1.125rem;
  color: var(--main-color-1);
  margin: 0;
}

.toggle-icon {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  transition: all 0.3s ease;
}

.calculation-content {
  padding: 20px;
}

.character-calculation {
  margin-bottom: 30px;
}

.character-calculation:last-child {
  margin-bottom: 0;
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

/* 动画 */
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

  .character-name {
    font-size: 1rem;
  }

  .mode-tabs {
    flex-wrap: wrap;
  }

  .mode-tab {
    flex: 1;
    text-align: center;
    min-width: 120px;
  }
}
</style>
