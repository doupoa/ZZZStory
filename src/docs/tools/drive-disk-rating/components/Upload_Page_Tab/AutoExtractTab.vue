<template>
  <transition name="fade">
    <div class="auto-new-section">
      <div class="card">
        <h2>自动提取驱动盘数据</h2>
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
              :href="getBookmarklet()"
              class="bookmarklet-btn"
              rel="noopener noreferrer"
            >
              一键提取并传输
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
            无法获取数据？试试手动填写
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const emit = defineEmits(["switch-mode", "data-received"]);

// 配置管理
const config = {
  allowedOrigins: ["act.mihoyo.com", "zzzstory.doupoa.site"],
  enableDetailedLogging: false,
  messageCount: 0,
};

const receivingStatus = ref(null);

function getBookmarklet() {
  const rawCode = `(()=>{if(window._napRunning)return alert("脚本正在运行中，请勿重复点击");window._napRunning=1;let t=(m,y)=>{let d=document.getElementById("nap-toast");d||(d=document.body.appendChild(Object.assign(document.createElement("div"),{id:"nap-toast",style:'position:fixed;top:20px;right:40%;padding:16px 20px;border-radius:12px;z-index:999;font:500 14px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:white;box-shadow:0 10px 40px rgba(0,0,0,.2);transition:.3s;border:1px solid rgba(255,255,255,.2);max-width:320px;line-height:1.5'})));d.style.cssText+=({info:"background:#667eea;color:#fff;",error:"background:#ff416c;color:#fff;cursor:pointer;",success:"background:#11998e;color:#fff;"}[y]||"");d.innerHTML=y=="error"?"[ERROR] "+m+'<div style="font-size:12px;opacity:.9;margin-top:4px;">点击关闭</div>':y=="success"?"[OK] "+m:"[WAIT] "+m;d.style.opacity=1;d.style.transform="translateY(0)";y=="error"?d.onclick=()=>{d.style.opacity=0;d.style.transform="translateY(-20px)"}:setTimeout(()=>{d.style.opacity=0;d.style.transform="translateY(-20px)"},y=="success"?4e3:1e4)};t("正在连接服务器...");let A="https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool",O="https://zzzstory.doupoa.site",g=(u,o={})=>fetch(u,{credentials:"include",...o}).then(r=>r.json());Promise.all([g("https://api-takumi.mihoyo.com/common/badge/v1/login/info?game_biz=nap_cn&lang=zh-cn").then(r=>r.data?.game_uid),document.cookie.match(/DEVICEFP=(\\w+)/)?.[1]]).then(async([u,f])=>{if(!u||!f)throw Error("未登录或Cookie无效，请先登录游戏账号");t(\`账号 \${u} 已识别，正在获取角色列表...\`);let{data:{list:l}}=await g(\`\${A}/user/avatar_basic_list?uid=\${u}&region=prod_gf_cn\`,{headers:{"x-rpc-device_fp":f}}),i=l.filter(x=>x.unlocked).map(x=>({avatar_id:x.avatar.id}));if(!i.length)throw Error("没有找到已解锁的角色");t(\`找到 \${i.length} 个角色，分批获取装备数据...\`);let b=[...Array(Math.ceil(i.length/10))].map((_,k)=>i.slice(k*10,k*10+10)),d=(await Promise.all(b.map(s=>g(\`\${A}/user/batch_avatar_detail_v2?uid=\${u}&region=prod_gf_cn\`,{method:"POST",headers:{"x-rpc-device_fp":f},body:JSON.stringify({avatar_list:s})})))) .flatMap(r=>r.data.list.map(({name:n,equip:e})=>({[n]:(e||[]).map(({main_properties:m,properties:p})=>({main:m?.[0]?{name:m[0].property_name,add:m[0].add}:null,sub:p?.map(x=>({name:x.property_name,add:x.add}))||[]}))})));if(!window.opener)throw Error("未找到来源页面（请从分析站点点击书签打开）");window.opener.postMessage({type:"nap-data",payload:d,uid:u,timestamp:Date.now()},O);t(\`成功！已发送 \${d.length} 个角色的装备数据，请切换回原分析页面查看\`,"success");window._napRunning=0}).catch(e=>{t(e.message,"error");console.error(e);window._napRunning=0})})();`;

  // UTF-8 → Base64
  const bytes = new TextEncoder().encode(rawCode);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const base64 = btoa(bin);

  // 书签执行：Base64 → UTF-8 → eval
  return (
    "javascript:(()=>{const b=atob('" +
    base64 +
    "');eval(new TextDecoder().decode(Uint8Array.from(b,c=>c.charCodeAt(0))))})();"
  );
}
// 验证来源
const validateOrigin = (origin) => {
  return config.allowedOrigins.some((allowedOrigin) =>
    origin.includes(allowedOrigin),
  );
};

// 记录消息
const recordMessage = () => {
  config.messageCount++;
};

// 格式化消息数据
const formatMessageData = (event) => {
  return `【${new Date().toLocaleString()} 收到消息】
来源: ${event.origin}
数据: ${JSON.stringify(event.data, null, 2)}
---`;
};

// 日志输出到控制台
const logMessage = (message, level = "info") => {
  if (!config.enableDetailedLogging) return;

  const logMethod =
    level === "error"
      ? console.error
      : level === "warning"
        ? console.warn
        : console.log;
  logMethod(`[PostMessage ${level.toUpperCase()}]:`, message);
};

// 消息处理器
const handleMessage = (event) => {
  try {
    // 详细的来源验证
    if (!validateOrigin(event.origin)) {
      logMessage(`来源验证失败: ${event.origin}`, "warning");
      return;
    }

    // 验证数据完整性
    if (!event.data || typeof event.data !== "object") {
      logMessage("接收到无效的数据格式", "warning");
      return;
    }

    // 记录消息
    recordMessage();

    // 支持多种消息类型
    if (
      (event.data?.type === "nap-data" ||
        event.data?.type === "ZZZ_CHARACTER_DATA") &&
      event.data?.payload
    ) {
      try {
        const data = event.data.payload;

        if (!Array.isArray(data)) {
          throw new Error("数据格式错误：应为数组");
        }

        // 记录详细日志
        logMessage(formatMessageData(event), "info");

        receivingStatus.value = {
          type: "success",
          icon: "✅",
          text: `成功接收 ${data.length} 个角色的数据！`,
        };

        setTimeout(() => {
          receivingStatus.value = null;
        }, 3000);

        emit("data-received", data);
      } catch (e) {
        receivingStatus.value = {
          type: "error",
          icon: "❌",
          text: "数据解析失败：" + e.message,
        };
        logMessage(`数据解析失败: ${e.message}`, "error");
        console.error("PostMessage 数据解析失败:", e);
      }
    } else {
      logMessage("接收到未知类型的消息", "warning");
    }
  } catch (error) {
    logMessage(`处理消息时出错: ${error.message}`, "error");
    console.error("Error handling message:", error);
  }
};

onMounted(() => {
  window.addEventListener("message", handleMessage);
  receivingStatus.value = {
    type: "info",
    icon: "⏳",
    text: "等待接收数据...请在官方页面点击书签按钮",
  };
  logMessage("系统就绪，开始监听 postMessage...", "info");
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
  background: var(--main-color-1);
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
  background: var(--main-color-1);
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
