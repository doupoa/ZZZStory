# 驱动盘评分工具规划书

## 1. 完善手动填写 / 自动化处理

保留手动填写页面，默认展示自动化引导，在官方拉闸或内部原因导致无法使用自动化工具时切换至手动填写，两者共用同一套评分权重。

## 2. 精简自动化流程与ZCode

### 方案对比

| 步骤         | 旧方案         | 新方案                 |
| ------------ | -------------- | ---------------------- |
| 1. 登录      | ✅             | ✅                     |
| 2. 点击书签  | ✅             | ✅                     |
| 3. 下载 JSON | ⚠️（小白困惑） | ❌（跳过）             |
| 4. 手动上传  | ⚠️（手机困难） | ❌（跳过）             |
| 5. 自动分析  | ❌             | ✅（新标签页直接展示） |

### 数据传递

通过 `书签脚本 + window.open + postMessage（跨域直传）`的方式打开iframe，待用户登录后运行书签脚本并直接透传至本站分析工具。

本站页面示例：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>绝区零角色分析器</title>
  </head>
  <body>
    <div id="status">等待角色数据...</div>
    <div id="result" style="display:none;"></div>

    <script>
      // 只接受来自米哈游官方域名的消息
      const ALLOWED_ORIGIN = "https://act.mihoyo.com";

      window.addEventListener("message", (event) => {
        // 严格校验来源
        if (event.origin !== ALLOWED_ORIGIN) {
          console.warn("拒绝非米哈游来源的消息:", event.origin);
          return;
        }

        // 校验消息格式
        if (event.data?.type === "ZZZ_CHARACTER_DATA" && event.data?.payload) {
          try {
            const data = event.data.payload; // 已是 JS 对象（非字符串）

            // 验证数据结构（可选）
            if (Array.isArray(data.characters)) {
              document.getElementById("status").textContent =
                `成功接收 ${data.characters.length} 个角色！`;
              document.getElementById("result").style.display = "block";

              //  在此处进行分析和渲染
              renderAnalysis(data);
            } else {
              throw new Error("数据结构无效");
            }
          } catch (e) {
            console.error("数据解析失败:", e);
            document.getElementById("status").textContent =
              "❌ 数据格式错误，请重试";
          }
        }
      });

      function renderAnalysis(data) {
        // TODO: 分析逻辑
        console.log("开始分析角色数据:", data);
        document.getElementById("result").innerHTML = "<p>分析完成！</p>";
      }
    </script>
  </body>
</html>
```

---

书签脚本示例：

```html
javascript:(function () { try { // 步骤1: 检查是否在正确页面 if
(!location.href.startsWith('https://act.mihoyo.com/zzz/gt/character-builder-h/'))
{ alert('请在绝区零角色养成页面使用此工具！'); return; } // 步骤2: 尝试提取数据
// 步骤3: 打开分析页面 const ANALYZER_URL =
'https://zzzstory.doupoa.site/tools/drive-disk-rating'; const popup =
window.open(ANALYZER_URL, '_blank'); if (!popup) {
alert('请允许弹出窗口，否则无法打开分析器！'); return; } // 步骤4:
等待页面加载后发送数据 // 使用定时器（简单可靠），或监听 message 回执（更健壮）
setTimeout(() => { try { popup.postMessage( { type: 'ZZZ_CHARACTER_DATA',
payload: characterData // 直接传对象，无需序列化 }, 'https://yourdomain.com' //
严格指定目标 origin ); console.log('角色数据已发送至分析器'); } catch (e) {
console.error('发送失败:', e); alert('数据发送失败，请重试'); } }, 1500); //
给分析页1.5秒加载时间 } catch (e) { console.error('书签脚本出错:', e);
alert('工具运行出错，请反馈给开发者'); } })();
```

### ZCode

该套简码力争在有限的空间传递更多的信息。

当前已有角色47名，Zcode单个角色驱动盘信息能压缩至36字符，共1,692 < 2,048 ，有望通过GET Params 直接传递。

目前副属性共10条，主属性14条，共6个分区，每个分区1个主属性4个副属性

#### 算法实现：Base64 混合编码

**核心逻辑**：Base64 一个字符可以代表 6 位二进制 (0-63)。我们需要把数据映射到 0-63 的范围内。

- **头部信息压缩 (Set + Level + Quality + Main)**
  - 套装 ID (0-49) _ 16 (Level 0-15) _ 3 (Quality 0-2) \* 14 (Main 0-13)
  - 最大值：`49 * 15 * 2 * 13 = 19,110`
  - 所需空间：16位二进制 (2个字节)。
  - **表现**：**2个 Base64 字符**。
- **副词条压缩 (Type + Level)**
  - 单个副词条：类型 (0-9) \* 等级 (0-5) = 60 种组合。
  - 最大值：`9 * 5 = 45`
  - 所需空间：6位二进制 (1个字节)。
  - **表现**：**1个 Base64 字符**。
  - 4个副词条 = **4个字符**。
- **单个驱动盘总长度**
  - 头部 (2字符) + 副词条 (4字符) = **6个字符**。

#### Z-Code 示例

**场景**：

- **套装**：震星迪斯科 (ID: 1)
- **等级**：15 (Value: 15)
- **品质**：S级 (Value: 2)
- **主词条**：攻击力% (ID: 3)
- **副词条**：攻击力% +5, 暴击率% +3, 空, 空
  **计算过程**：

1.  **计算头部值**：
    - `Value = ((Set * 16) + Level) * 3 + Quality) * 14 + Main`
    - `Value = ((1 * 16) + 15) * 3 + 2) * 14 + 3`
    - `Value = 31 * 3 + 2 = 95` -> `95 * 14 + 3 = 1333`
    - **转 Base64 (2字符)**：`KX` (假设映射表)
2.  **计算副词条**：
    - 攻击力% (ID:3) +5 -> `3 * 6 + 5 = 23` -> Base64: `X`
    - 暴击率% (ID:6) +3 -> `6 * 6 + 3 = 39` -> Base64: `n`
    - 空 (ID:0) +0 -> `0` -> Base64: `A`
    - 空 (ID:0) +0 -> `0` -> Base64: `A`
3.  **最终代码**：
    - `KXXnAA` (6字符)

#### 完整编码表与算法

**Base64 字符表 (自定义顺序)**：

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-_` (共64个字符)

**解码逻辑 (伪代码)**：

```javascript
function parseZCodeV2(code) {
  // code 是 6 * 6 = 36 字符的字符串
  const base64Map = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-_";

  for (let i = 0; i < 6; i++) {
    let block = code.substring(i * 6, (i + 1) * 6);

    // 1. 解析头部 (2字符)
    let headerVal = decodeBase64(block[0]) * 64 + decodeBase64(block[1]);

    // 逆运算提取 Main, Quality, Level, Set
    let mainStat = headerVal % 14;
    headerVal = Math.floor(headerVal / 14);

    let quality = headerVal % 3;
    headerVal = Math.floor(headerVal / 3);

    let level = headerVal % 16;
    headerVal = Math.floor(headerVal / 16);

    let setID = headerVal; // 这里的 setID 就是套装ID

    // 2. 解析副词条 (4字符)
    let subs = [];
    for (let j = 0; j < 4; j++) {
      let sVal = decodeBase64(block[2 + j]);
      if (sVal > 0) {
        subs.push({
          type: Math.floor(sVal / 6),
          level: sVal % 6,
        });
      }
    }
  }
}
```
