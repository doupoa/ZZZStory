<template>
  <div class="drive-rating-app">
    <div class="container">
      <header>
        <div class="header-content">
          <h1>绝区零驱动盘评级系统</h1>
        </div>
      </header>

      <div class="main-content">
        <transition name="fade-slide">
          <div v-if="characters.length === 0" class="card step-card step-1 full-width">
            <div class="step-header">
              <div class="step-number">1</div>
              <h2 class="card-title">📁 上传驱动盘数据</h2>
            </div>
            
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
            >

            <div v-if="fileInfo" class="file-info">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 2rem;">📄</span>
                <div>
                  <div style="font-weight: 600; color: var(--vp-c-text-1); margin-bottom: 4px;">
                    {{ fileInfo.name }}
                  </div>
                  <div style="font-size: 0.875rem; color: var(--vp-c-text-2);">
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

            <div class="oneclick-section">
              <div class="oneclick-header">
                <h3>🚀 一键提取驱动盘数据</h3>
                <p class="oneclick-desc">使用书签脚本，在官方页面一键提取驱动盘数据</p>
              </div>

              <div class="oneclick-step">
                <div class="step-number-wrapper">1</div>
                <div class="step-content">
                  <strong>访问官方页面</strong>
                  <p>点击下方按钮打开绝区零角色练度页面，并确保您已登录账号。</p>
                  <a href="https://act.mihoyo.com/zzz/gt/character-builder-h/index.html#/" target="_blank" class="btn btn-primary">
                    打开角色练度页面 ↗
                  </a>
                </div>
              </div>

              <div class="oneclick-step">
                <div class="step-number-wrapper">2</div>
                <div class="step-content">
                  <strong>添加书签脚本</strong>
                  <p><span class="highlight">拖拽</span> 下方的按钮到浏览器的书签栏中，或者右键点击按钮选择"添加到书签"。</p>
                  <a href="javascript:(async function(){const API_BASE='https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool';const API_LOGIN='https://api-takumi.mihoyo.com/common/badge/v1/login/info';const cleanText=t=>t?.replace(/<[^>]*>/g,'').replace(/\\n/g,'')||'';const fetchJSON=(t,e)=>fetch(t,{credentials:'include',...e}).then(t=>t.json());const getGameUID=async()=>(await fetchJSON(`${API_LOGIN}?game_biz=nap_cn&lang=zh-cn`)).data?.game_uid;const getDeviceFP=()=>document.cookie.match(/DEVICEFP=(\w+)/)?.[1];const getBasicList=(t,e)=>fetchJSON(`${API_BASE}/user/avatar_basic_list?uid=${t}&region=prod_gf_cn`,{headers:{'x-rpc-device_fp':e}});const getEquipBatch=(t,e,o)=>fetchJSON(`${API_BASE}/user/batch_avatar_detail_v2?uid=${t}&region=prod_gf_cn`,{method:'POST',headers:{'x-rpc-device_fp':o},body:JSON.stringify({avatar_list:e})});const processEquipData=({avatar:t,equip:e,weapon:o})=>({characterName:t.name_mi18n,characterFullName:t.full_name_mi18n,level:t.level,profession:t.avatar_profession,driveDiscs:e?.map(({level:t,name:e,icon:o,rarity:a,invalid_property_cnt:i,equipment_type:s,properties:r,main_properties:n,equip_suit:c})=>({position:s,name:e,level:t,rarity:a,invalidProperty:i,mainProperty:{name:n[0].property_name,val:n[0].base},subProperties:r.map(({property_name:t,base:e,level:o,valid:a,add:i})=>({name:t,val:e,level:o,valid:a,add:i})),suit:{name:c.name,desc1:c.desc1,desc2:cleanText(c.desc2)}}))||[]});const uid=await getGameUID();const device_fp=getDeviceFP();if(!uid||!device_fp){alert('❌ 无法读取 UID 或 DEVICEFP，可能未登录！');return;}const basicData=await getBasicList(uid,device_fp);const avatarList=basicData.data.list.filter(t=>t.unlocked).map(t=>({avatar_id:t.avatar.id}));const batches=[];for(let t=0;t<avatarList.length;t+=10)batches.push(avatarList.slice(t,t+10));const detailResponses=await Promise.all(batches.map(t=>getEquipBatch(uid,t,device_fp)));const allResults=detailResponses.flatMap(t=>t.data.list.map(processEquipData));const result=allResults.map(t=>({...t,driveDiscs:t.driveDiscs.map(d=>({...d,mainProperty:{name:d.mainProperty.name,value:d.mainProperty.val.toString()},subProperties:d.subProperties.map(s=>({...s,value:s.val.toString()}))}))}));const dataStr=JSON.stringify(result,null,2);const blob=new Blob([dataStr],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='drive_discs_data.json';a.click();URL.revokeObjectURL(url);alert(`✅ 成功提取 ${result.length} 个角色的驱动盘数据！`);})();" class="btn btn-bookmarklet">
                    🎮 一键提取驱动盘
                  </a>
                  <p class="hint">💡 提示：如果看不到书签栏，按 <code>Ctrl+Shift+B</code> (Windows) 或 <code>Cmd+Shift+B</code> (Mac) 显示</p>
                </div>
              </div>

              <div class="oneclick-step">
                <div class="step-number-wrapper">3</div>
                <div class="step-content">
                  <strong>一键提取数据</strong>
                  <p>在官方页面点击书签栏中的 <span class="highlight">"🎮 一键提取驱动盘"</span> 按钮，脚本将自动提取所有角色的驱动盘数据并下载为 JSON 文件。</p>
                </div>
              </div>

              <div class="warning-box">
                <strong>⚠️ 注意事项：</strong>
                <ul>
                  <li>确保您已在官方页面登录绝区零账号</li>
                  <li>提取的数据仅保存在本地，不会上传到任何服务器</li>
                  <li>首次使用可能需要几秒钟时间，请耐心等待</li>
                  <li>如果遇到错误，请检查网络连接和登录状态</li>
                  <li>建议使用 Chrome、Edge 或 Firefox 浏览器</li>
                </ul>
              </div>
            </div>
          </div>
        </transition>

        <transition name="fade-slide">
          <div v-if="characters.length > 0" class="card step-card step-2 full-width">
            <div class="step-header step-header-with-button">
              <div class="step-number">2</div>
              <h2 class="card-title">📊 评分结果</h2>
              <button @click="handleReset" class="btn btn-secondary">
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
      </transition>
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
                  <div class="calc-row">
                    <span class="calc-label">副词条权重总和:</span>
                    <span class="calc-value">{{ disc.details.subPropertiesWeight.toFixed(4) }}</span>
                  </div>
                  <div class="calc-row">
                    <span class="calc-label">主属性权重:</span>
                    <span class="calc-value">{{ disc.details.mainPropertyWeight.toFixed(4) }}</span>
                  </div>
                  <div class="calc-row">
                    <span class="calc-label">最大权重总和:</span>
                    <span class="calc-value">{{ disc.details.maxWeightSum.toFixed(4) }}</span>
                  </div>
                  <div class="calc-row calc-formula">
                    <span class="calc-label">计算公式:</span>
                    <span class="calc-value">
                      ({{ disc.details.subPropertiesWeight.toFixed(4) }} + {{ disc.details.mainPropertyWeight.toFixed(4) }}) 
                      × (55 ÷ {{ disc.details.maxWeightSum.toFixed(4) }}) 
                      × {{ disc.details.qualityWeight.toFixed(2) }}
                    </span>
                  </div>
                  
                  <div v-if="disc.details.validProperties.length > 0" class="valid-properties-section">
                    <div class="valid-props-title">有效副词条详情:</div>
                    <div v-for="(prop, index) in disc.details.validProperties" :key="index" class="valid-prop-item">
                      <span class="prop-name">{{ prop.name }} {{ prop.value }}</span>
                      <span class="prop-weight">权重: {{ prop.weight.toFixed(2) }}</span>
                      <span class="prop-contribution">贡献: {{ prop.weightedValue.toFixed(4) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCharacterAvatarUrl, getAvataredCharacters } from './character-avatar-map.ts'
import { getCharacterWeights, getConfiguredCharacters } from './character-weights.ts'

const isDragover = ref(false)
const fileInfo = ref(null)
const error = ref(null)
const isLoading = ref(false)
const characters = ref([])
const showCalculation = ref(false)
const selectedCharacter = ref('叶瞬光')
const allCharacterData = ref([])

// 计算属性：获取同时有权重配置和头像映射的角色列表
const availableCharacters = computed(() => {
  const configuredChars = getConfiguredCharacters()
  const avataredChars = getAvataredCharacters()
  
  // 求交集：同时存在于两个列表中的角色
  return configuredChars.filter(char => avataredChars.includes(char))
})

const toggleCalculation = () => {
  showCalculation.value = !showCalculation.value
}

const triggerFileInput = () => {
  document.getElementById('fileInput').click()
}

const handleDragOver = () => {
  isDragover.value = true
}

const handleDragLeave = () => {
  isDragover.value = false
}

const handleDrop = (e) => {
  isDragover.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const processFile = async (file) => {
  if (!file.name.endsWith('.json')) {
    error.value = '请上传 JSON 格式文件'
    return
  }

  isLoading.value = true
  error.value = null
  fileInfo.value = {
    name: file.name,
    size: file.size
  }

  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    if (!Array.isArray(data)) {
      error.value = 'JSON 数据格式错误：应为数组'
      return
    }

    // 保存所有角色数据
    allCharacterData.value = data
    
    // 显示选中的角色
    switchCharacter(selectedCharacter.value)

  } catch (err) {
    error.value = '文件解析失败：' + err.message
  } finally {
    isLoading.value = false
  }
}

const switchCharacter = (characterName) => {
  const targetCharacter = allCharacterData.value.find(c => c.characterName === characterName)
  
  if (!targetCharacter) {
    error.value = `未找到角色 "${characterName}" 的数据`
    characters.value = []
    return
  }
  
  error.value = null
  
  try {
    // 即使没有驱动盘数据，也显示角色卡片
    if (!targetCharacter.driveDiscs || targetCharacter.driveDiscs.length === 0) {
      // 显示空的角色卡片
      characters.value = [{
        ...targetCharacter,
        totalScore: 0,
        averageScore: 0,
        discScores: {},
        discDetails: []
      }]
      return
    }
    
    // 保留所有驱动盘（1-5号位）
    const allDiscs = targetCharacter.driveDiscs
    
    const result = calculateCharacterTotalScore(targetCharacter)
    characters.value = [{
      ...targetCharacter,
      ...result
    }]
  } catch (err) {
    console.error(`处理角色 "${characterName}" 时出错:`, err)
    error.value = `处理角色 "${characterName}" 时出错: ${err.message}`
    characters.value = []
  }
}

const handleCharacterChange = (event) => {
  const characterName = event.target.value
  selectedCharacter.value = characterName
  switchCharacter(characterName)
}

const handleReset = () => {
  characters.value = []
  fileInfo.value = null
  error.value = null
  isLoading.value = false
  document.getElementById('fileInput').value = ''
}



// ========== 评分算法 ==========
function calculateDriveDiscScore(
  driveDisc,
  roleName = 'default'
) {
  if (!driveDisc || typeof driveDisc !== 'object') {
    throw new Error('driveDisc 必须是对象')
  }
  
  if (!driveDisc.subProperties || !Array.isArray(driveDisc.subProperties)) {
    throw new Error(`驱动盘缺少 subProperties 数组: ${JSON.stringify(driveDisc)}`)
  }
  
  const weights = getCharacterWeights(roleName)
  
  // 步骤1：计算品质权重
  const rarity = driveDisc.rarity || 'S'
  const qualityWeight = {
    'S': 1,
    'A': 0.67,
    'B': 0.33
  }[rarity] || 1
  
  // 步骤2：计算主词条等级权重（0级0.25，每升1级+0.05，15级达1）
  const level = driveDisc.level || 0
  const levelWeight = Math.min(0.25 + level * 0.05, 1)
  
  // 步骤3：计算实际有效副词条权重总和
  const subProperties = Array.isArray(driveDisc.subProperties) ? driveDisc.subProperties : []
  const validSubProperties = subProperties.filter(prop => {
    // 动态计算 valid 状态（根据角色权重配置）
    let propertyName = prop.name
    
    // 如果属性值不包含%，且是生命值/攻击力/防御力，则视为小属性
    if (!prop.value.includes('%') && ['生命值', '攻击力', '防御力'].includes(prop.name)) {
      if (prop.name === '攻击力') {
        propertyName = '小攻击'
      } else if (prop.name === '生命值') {
        propertyName = '小生命'
      } else if (prop.name === '防御力') {
        propertyName = '小防御'
      }
    }
    
    // 获取该属性的权重
    const weight = weights[propertyName] || 0
    
    // 如果权重 > 0，则视为有效词条
    return weight > 0
  })
  
  let subPropertiesWeight = 0
  const validProperties = []
  
  validSubProperties.forEach(prop => {
    // 根据数值类型区分大属性和小属性
    let propertyName = prop.name
    
    // 如果属性值不包含%，且是生命值/攻击力/防御力，则视为小属性
    if (!prop.value.includes('%') && ['生命值', '攻击力', '防御力'].includes(prop.name)) {
      if (prop.name === '攻击力') {
        propertyName = '小攻击'
      } else if (prop.name === '生命值') {
        propertyName = '小生命'
      } else if (prop.name === '防御力') {
        propertyName = '小防御'
      }
    }
    
    const weight = weights[propertyName] || 0
    const addValue = prop.add || 0
    const weightedValue = weight + addValue * weight
    subPropertiesWeight += weightedValue
    
    // 添加到有效属性列表
    validProperties.push({
      name: prop.name,
      value: prop.value,
      weight: weight,
      level: prop.level,
      weightedValue: weightedValue
    })
  })
  
  // 确保position是有效的数字
  const position = typeof driveDisc.position === 'number' ? driveDisc.position : 1
  
  // 确保mainProperty是有效的对象
  const mainProperty = driveDisc.mainProperty || { name: '', value: '' }
  
  // 步骤4：处理4~6号位主词条实际等值权重
  let mainPropertyWeight = 0
  if (position >= 4 && position <= 6) {
    // 4~6号位主词条等值3条副词条，权重为3 × 主属性权重 × 等级权重
    const mainPropWeight = weights[mainProperty.name] || 0
    mainPropertyWeight = 3 * mainPropWeight * levelWeight
  }
  
  // 步骤5：计算该部位的最高词条数总和
  const excludeKeywords = ['伤害加成', '异常掌控', '穿透率', '能量自动回复']
  const validWeights = Object.entries(weights)
    .filter(([name]) => !excludeKeywords.some(keyword => name.includes(keyword)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([_, weight]) => weight)
  
  const first = validWeights[0] || 0
  const second = validWeights[1] || 0
  const third = validWeights[2] || 0
  const fourth = validWeights[3] || 0
  const subPropertyMax = 6 * first + 1 * second + 1 * third + 1 * fourth
  
  // 计算当前驱动盘主属性理想最大有效条数
  const mainPropertyName = mainProperty.name
  const mainPropWeight = weights[mainPropertyName] || 0
  
  // 4-6号位主属性最大有效条数
  // 如果主属性权重为0，视为2条（无效词条）
  // 如果主属性权重>0，视为3条
  let mainPropertyMax = 0
  if (position >= 4 && position <= 6) {
    if (mainPropWeight === 0) {
      mainPropertyMax = 2 // 当主属性权重为0时，视为2条有效词条
    } else {
      mainPropertyMax = 3 * mainPropWeight
    }
  }
  
  // 最高词条数总和
  const maxWeightSum = subPropertyMax + mainPropertyMax
  
  // 步骤6：计算每1权重有效词条分值
  const scorePerWeight = 55 / maxWeightSum
  
  // 步骤7：计算实际分值
  const actualScore = (subPropertiesWeight + mainPropertyWeight) * scorePerWeight * qualityWeight
  
  return {
    score: Math.round(actualScore * 10) / 10,
    subPropertiesWeight,
    mainPropertyWeight,
    maxWeightSum,
    validProperties,
    qualityWeight,
    levelWeight
  }
}

function calculateCharacterTotalScore(
  characterData
) {
  const discScores = {}
  const discDetails = []
  
  // 初始化所有6个位置
  for (let i = 1; i <= 6; i++) {
    discScores[i] = 0
  }
  
  let totalScore = 0
  let discCount = 0
  
  for (const driveDisc of characterData.driveDiscs) {
    const result = calculateDriveDiscScore(driveDisc, characterData.characterName)
    discScores[driveDisc.position] = result.score
    totalScore += result.score
    discCount++
    
    discDetails.push({
      position: driveDisc.position,
      name: driveDisc.name,
      level: driveDisc.level,
      rarity: driveDisc.rarity,
      mainProperty: driveDisc.mainProperty || { name: '无', value: 0 },
      score: result.score,
      details: result
    })
  }
  
  // 为未装备的位置添加空数据
  for (let i = 1; i <= 6; i++) {
    if (!characterData.driveDiscs.some(disc => disc.position === i)) {
      discDetails.push({
        position: i,
        name: '未装备',
        level: 0,
        rarity: '-',
        mainProperty: { name: '无', value: 0 },
        score: 0,
        details: {
          score: 0,
          subPropertiesWeight: 0,
          mainPropertyWeight: 0,
          maxWeightSum: 0,
          validProperties: [],
          qualityWeight: 0,
          levelWeight: 0
        }
      })
    }
  }
  
  // 按位置排序
  discDetails.sort((a, b) => a.position - b.position)
  
  // 计算平均分（只计算已装备的驱动盘）
  const averageScore = discCount > 0 ? totalScore / discCount : 0
  
  return {
    totalScore: Math.round(totalScore * 10) / 10,  // 总和
    averageScore: Math.round(averageScore * 10) / 10,  // 平均分
    discScores,
    discDetails
  }
}

onMounted(() => {
  console.log('Drive Rating App mounted')
})
</script>

<style scoped>
.drive-rating-app {
  min-height: 100vh;
  padding: 20px 0;
}

.container {
  max-width: 1920px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  margin-bottom: 40px;
  padding: 30px 0;
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  display: flex;
  justify-content: center;
}

.header-content {
  width: 100%;
  max-width: 1920px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
}

h1 {
  font-size: 2.5rem;
  background: linear-gradient(120deg, #c8e700 30%, #ee7309);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 40px;
  align-items: center;
}

.main-content > * {
  width: 100%;
  max-width: 1200px;
}

.full-width {
  max-width: 100%;
}

@media (min-width: 1920px) {
  .main-content {
    grid-template-columns: 1fr 1fr;
    gap: 80px;
  }
  
  .card {
    padding: 32px;
  }
}

.card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--main-color-1);
  box-shadow: 0 4px 20px rgba(238, 115, 9, 0.1);
}

.step-card {
  position: relative;
  overflow: visible;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--main-color-1), var(--main-color-2));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(238, 115, 9, 0.3);
}

.step-1 .step-number {
  background: linear-gradient(135deg, #c8e700, #a8c600);
}

.step-2 .step-number {
  background: linear-gradient(135deg, var(--main-color-1), var(--main-color-2));
}



.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--main-color-1);
  margin: 0;
}

.fade-slide-enter-active {
  transition: all 0.5s ease-out;
}

.fade-slide-leave-active {
  transition: all 0.3s ease-in;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.step-1.completed {
  opacity: 0.7;
  transform: scale(0.98);
}

.step-1.completed .step-number {
  background: linear-gradient(135deg, #2ecc71, #27ae60) !important;
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.upload-area {
  border: 2px dashed var(--vp-c-divider);
  border-radius: 12px;
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
  font-size: 4rem;
  margin-bottom: 24px;
}

.upload-text {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--vp-c-text-1);
}

.upload-hint {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.oneclick-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid var(--vp-c-divider);
}

.oneclick-header {
  text-align: center;
  margin-bottom: 30px;
}

.oneclick-header h3 {
  font-size: 1.5rem;
  color: var(--main-color-1);
  margin-bottom: 8px;
}

.oneclick-desc {
  font-size: 1rem;
  color: var(--vp-c-text-2);
}

.oneclick-step {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.step-number-wrapper {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--main-color-1), var(--main-color-2));
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
  font-size: 1.1rem;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 8px 0;
}

.btn-primary {
  background: linear-gradient(135deg, var(--main-color-1), var(--main-color-2));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(238, 115, 9, 0.3);
}

.btn-bookmarklet {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 16px 32px;
  font-size: 1.1rem;
  white-space: nowrap;
}

.btn-bookmarklet:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
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
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.875rem;
}

.warning-box {
  background: var(--vp-c-warning-soft);
  border-left: 4px solid var(--vp-c-warning-1);
  padding: 20px;
  border-radius: 0 8px 8px 0;
  margin-top: 24px;
}

.warning-box strong {
  color: var(--vp-c-warning-1);
  display: block;
  margin-bottom: 12px;
}

.warning-box ul {
  margin: 0;
  padding-left: 20px;
}

.warning-box li {
  color: var(--vp-c-text-2);
  line-height: 1.8;
  margin-bottom: 8px;
}

.step-header-with-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.step-header-with-button .step-number {
  flex-shrink: 0;
}

.step-header-with-button .card-title {
  flex: 1;
  text-align: left;
  margin: 0;
}

.btn-secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}

.btn-secondary:hover {
  background: var(--vp-c-divider);
  border-color: var(--main-color-1);
  color: var(--main-color-1);
}

  .file-input {
  display: none;
}

.file-info {
  background: var(--vp-c-success-soft);
  border: 1px solid var(--vp-c-success-1);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.error-message {
  background: var(--vp-c-danger-soft);
  border: 1px solid var(--vp-c-danger-1);
  border-radius: 8px;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 8px;
}

.btn-primary {
  background: var(--main-color-1);
  color: white;
}

.btn-primary:hover {
  background: var(--main-color-2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(238, 115, 9, 0.3);
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.btn-secondary:hover {
  border-color: var(--main-color-1);
  color: var(--main-color-1);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--vp-c-text-2);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.character-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr !important;
  }
  
  .disc-grid {
    grid-template-columns: 1fr !important;
  }
  
  .character-name {
    font-size: 1.25rem !important;
  }
  
  .character-score {
    font-size: 1.5rem !important;
  }
}

.character-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
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
  font-size: 1.5rem;
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

.no-data-message {
  text-align: center;
  padding: 40px 20px;
  color: var(--vp-c-text-2);
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-data-text {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--vp-c-text-1);
}

.no-data-hint {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.character-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--vp-c-divider);
}

.character-score {
  font-size: 2rem;
  font-weight: 700;
  color: var(--main-color-1);
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
  font-size: 0.9rem;
  color: var(--vp-c-success-1);
}

.disc-score {
  font-size: 1.1rem;
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

/* ========== 计算过程详情样式 ========== */
.calculation-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin-top: 30px;
  overflow: hidden;
}

.calculation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all 0.3s ease;
}

.calculation-header:hover {
  background: var(--vp-c-bg-soft);
}

.calculation-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--main-color-1);
  margin: 0;
}

.toggle-icon {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  transition: all 0.3s ease;
}

.calculation-content {
  padding: 24px;
}

.character-calculation {
  margin-bottom: 30px;
}

.character-calculation:last-child {
  margin-bottom: 0;
}

.character-calc-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--main-color-1);
}

.disc-calculation {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.disc-calc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--main-color-1), var(--main-color-2));
  color: white;
}

.disc-calc-position {
  font-weight: 700;
  font-size: 1.1rem;
}

.disc-calc-name {
  flex: 1;
  text-align: center;
  font-weight: 500;
  opacity: 0.95;
}

.disc-calc-score {
  font-weight: 700;
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

.calc-formula {
  background: rgba(238, 115, 9, 0.05);
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 8px;
}

.calc-formula .calc-value {
  color: var(--main-color-1);
  font-weight: 600;
}

.valid-properties-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid var(--vp-c-divider);
}

.valid-props-title {
  font-weight: 600;
  color: var(--main-color-1);
  margin-bottom: 12px;
  font-size: 1rem;
}

.valid-prop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.valid-prop-item:hover {
  background: rgba(238, 115, 9, 0.1);
  transform: translateX(4px);
}

.prop-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
  flex: 1;
}

.prop-weight {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  margin: 0 16px;
}

.prop-contribution {
  color: var(--main-color-1);
  font-weight: 600;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 展开/收起动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding: 0 24px;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 5000px;
}

/* ========== 计算过程详情样式 ========== */
.calculation-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin-top: 30px;
  overflow: hidden;
}

.calculation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all 0.3s ease;
}

.calculation-header:hover {
  background: var(--vp-c-bg-soft);
}

.calculation-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--main-color-1);
  margin: 0;
}

.toggle-icon {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  transition: all 0.3s ease;
}

.calculation-content {
  padding: 24px;
}

.character-calculation {
  margin-bottom: 30px;
}

.character-calculation:last-child {
  margin-bottom: 0;
}

.character-calc-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--main-color-1);
}

.disc-calculation {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.disc-calc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--main-color-1), var(--main-color-2));
  color: white;
}

.disc-calc-position {
  font-weight: 700;
  font-size: 1.1rem;
}

.disc-calc-name {
  flex: 1;
  text-align: center;
  font-weight: 500;
  opacity: 0.95;
}

.disc-calc-score {
  font-weight: 700;
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

.calc-formula {
  background: rgba(238, 115, 9, 0.05);
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 8px;
}

.calc-formula .calc-value {
  color: var(--main-color-1);
  font-weight: 600;
}

.valid-properties-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid var(--vp-c-divider);
}

.valid-props-title {
  font-weight: 600;
  color: var(--main-color-1);
  margin-bottom: 12px;
  font-size: 1rem;
}

.valid-prop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.valid-prop-item:hover {
  background: rgba(238, 115, 9, 0.1);
  transform: translateX(4px);
}

.prop-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
  flex: 1;
}

.prop-weight {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  margin: 0 16px;
}

.prop-contribution {
  color: var(--main-color-1);
  font-weight: 600;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 展开/收起动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding: 0 24px;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 5000px;
}
</style>
