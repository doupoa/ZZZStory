<template>
  <transition name="fade">
    <div class="auto-new-section">
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
              href="javascript:(async function(){const API_BASE='https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool';const API_LOGIN='https://api-takumi.mihoyo.com/common/badge/v1/login/info';const cleanText=t=>t?.replace(/<[^>]*>/g,'').replace(/\\n/g,'')||'';const fetchJSON=(t,e)=>fetch(t,{credentials:'include',...e}).then(t=>t.json());const getGameUID=async()=>(await fetchJSON(`${API_LOGIN}?game_biz=nap_cn&lang=zh-cn`)).data?.game_uid;const getDeviceFP=()=>document.cookie.match(/DEVICEFP=(\\w+)/)?.[1];const getBasicList=(t,e)=>fetchJSON(`${API_BASE}/user/avatar_basic_list?uid=${t}&region=prod_gf_cn`,{headers:{'x-rpc-device_fp':e}});const getEquipBatch=(t,e,o)=>fetchJSON(`${API_BASE}/user/batch_avatar_detail_v2?uid=${t}&region=prod_gf_cn`,{method:'POST',headers:{'x-rpc-device_fp':o},body:JSON.stringify({avatar_list:e})});const processEquipData=({avatar:t,equip:e,weapon:o})=>({characterName:t.name_mi18n,characterFullName:t.full_name_mi18n,level:t.level,profession:t.avatar_profession,driveDiscs:e?.map(({level:t,name:e,icon:o,rarity:a,invalid_property_cnt:i,equipment_type:s,properties:r,main_properties:n,equip_suit:c})=>({position:s,name:e,level:t,rarity:a,invalidProperty:i,mainProperty:{name:n[0].property_name,val:n[0].base},subProperties:r.map(({property_name:t,base:e,level:o,valid:a,add:i})=>({name:t,val:e,level:o,valid:a,add:i})),suit:{name:c.name,desc1:c.desc1,desc2:cleanText(c.desc2)}}))||[]});const uid=await getGameUID();const device_fp=getDeviceFP();if(!uid||!device_fp){alert('❌ 无法读取 UID 或 DEVICEFP，可能未登录！');return;}const basicData=await getBasicList(uid,device_fp);const avatarList=basicData.data.list.filter(t=>t.unlocked).map(t=>({avatar_id:t.avatar.id}));const batches=[];for(let t=0;t<avatarList.length;t+=10)batches.push(avatarList.slice(t,t+10));const detailResponses=await Promise.all(batches.map(t=>getEquipBatch(uid,t,device_fp)));const allResults=detailResponses.flatMap(t=>t.data.list.map(processEquipData));const result=allResults.map(t=>({...t,discDetails:t.driveDiscs.map(d=>({...d,mainProperty:{...d.mainProperty,value:d.mainProperty?.val||d.mainProperty?.value}}))}));const newWindow=window.open('https://zzzstory.doupoa.site/tools/drive-disk-rating/','_blank');if(newWindow){newWindow.addEventListener('load',()=>{setTimeout(()=>{newWindow.postMessage({type:'ZZZ_CHARACTER_DATA',payload:result},'*');alert('✅ 数据已传输！');},1000);});}else{alert('❌ 无法打开新窗口，请检查弹窗拦截设置。');}})();"
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

        <div
          v-if="receivingStatus"
          :class="['status-box', receivingStatus.type]"
        >
          <div class="status-icon">{{ receivingStatus.icon }}</div>
          <div class="status-text">{{ receivingStatus.text }}</div>
        </div>

        <div class="switch-hint">
          <button @click="$emit('switch-mode', 'manual')" class="switch-btn">
            ✏️ 无法获取数据？试试手动填写
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

defineEmits(["switch-mode", "data-received"]);

const receivingStatus = ref(null);

const handleMessage = (event) => {
  const allowedOrigins = [
    "https://act.mihoyo.com",
    "https://zzzstory.doupoa.site",
  ];
  if (!allowedOrigins.includes(event.origin)) {
    console.warn("拒绝非信任来源的消息:", event.origin);
    return;
  }

  if (event.data?.type === "ZZZ_CHARACTER_DATA" && event.data?.payload) {
    try {
      const data = event.data.payload;

      if (!Array.isArray(data)) {
        throw new Error("数据格式错误：应为数组");
      }

      receivingStatus.value = {
        type: "success",
        icon: "✅",
        text: `成功接收 ${data.length} 个角色的数据！`,
      };

      setTimeout(() => {
        receivingStatus.value = null;
      }, 3000);

      $emit("data-received", data);
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
</script>

<style scoped>
.auto-new-section {
  margin-top: 20px;
}

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

.bookmarklet-step {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.step-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--main-color-1), var(--main-color-2));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
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
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 0 0 12px 0;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  background: var(--main-color-1);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  background: var(--main-color-2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(238, 115, 9, 0.3);
}

.bookmarklet-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--main-color-1), var(--main-color-2));
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: move;
}

.bookmarklet-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(238, 115, 9, 0.4);
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
}

.status-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.status-box.info {
  background: var(--vp-c-info-soft);
  border: 1px solid var(--vp-c-info-1);
  color: var(--vp-c-info-1);
}

.status-box.success {
  background: var(--vp-c-success-soft);
  border: 1px solid var(--vp-c-success-1);
  color: var(--vp-c-success-1);
}

.status-box.error {
  background: var(--vp-c-danger-soft);
  border: 1px solid var(--vp-c-danger-1);
  color: var(--vp-c-danger-1);
}

.status-icon {
  font-size: 1.5rem;
}

.status-text {
  font-weight: 500;
}

.switch-hint {
  margin-top: 20px;
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
</style>
