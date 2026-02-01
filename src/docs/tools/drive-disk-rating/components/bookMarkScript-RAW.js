// 人类可读版（维护用）
(() => {
  // 防止重复运行
  if (window._napRunning) {
    alert("脚本正在运行中，请勿重复点击");
    return;
  }
  window._napRunning = true;

  // 创建通知系统
  const toast = (msg, type) => {
    let d = document.getElementById("nap-toast");
    if (!d) {
      d = document.createElement("div");
      d.id = "nap-toast";
      d.style.cssText =
        "position:fixed;top:20px;right:40%;padding:16px 20px;border-radius:12px;z-index:999;font-size:14px;font-weight:500;box-shadow:0 10px 40px rgba(0,0,0,0.2);transition:all 0.3s ease;border:1px solid rgba(255,255,255,0.2);max-width:320px;line-height:1.5;";
      document.body.appendChild(d);
    }
    const styles = {
      info: "background:#667eea;color:#fff;",
      error: "background:#ff416c;color:#fff;cursor:pointer;",
      success: "background:#11998e;color:#fff;",
    };
    d.style.cssText += styles[type] || styles.info;
    d.innerHTML =
      type === "error"
        ? "[ERROR] " +
          msg +
          '<div style="font-size:12px;opacity:0.9;margin-top:4px;">点击关闭</div>'
        : type === "success"
          ? "[OK] " + msg
          : "[WAIT] " + msg;
    d.style.opacity = "1";
    d.style.transform = "translateY(0)";

    if (type === "error") {
      d.onclick = () => {
        d.style.opacity = "0";
        d.style.transform = "translateY(-20px)";
      };
    } else {
      setTimeout(
        () => {
          d.style.opacity = "0";
          d.style.transform = "translateY(-20px)";
        },
        type === "success" ? 4000 : 10000,
      );
    }
  };

  toast("正在连接服务器...", "info");

  const API = "https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool";
  const TARGET_ORIGIN = "https://zzzstory.doupoa.site";

  const get = (u, o = {}) =>
    fetch(u, { credentials: "include", ...o }).then((r) => r.json());

  Promise.all([
    get(
      "https://api-takumi.mihoyo.com/common/badge/v1/login/info?game_biz=nap_cn&lang=zh-cn",
    ).then((r) => r.data?.game_uid),
    document.cookie.match(/DEVICEFP=(\w+)/)?.[1],
  ])
    .then(async ([uid, fp]) => {
      if (!uid || !fp) throw new Error("未登录或Cookie无效，请先登录游戏账号");

      toast(`账号 ${uid} 已识别，正在获取角色列表...`, "info");

      const {
        data: { list },
      } = await get(
        `${API}/user/avatar_basic_list?uid=${uid}&region=prod_gf_cn`,
        {
          headers: { "x-rpc-device_fp": fp },
        },
      );

      const ids = list
        .filter((x) => x.unlocked)
        .map((x) => ({ avatar_id: x.avatar.id }));
      if (!ids.length) throw new Error("没有找到已解锁的角色");

      toast(`找到 ${ids.length} 个角色，分批获取装备数据...`, "info");

      const batches = Array.from(
        { length: Math.ceil(ids.length / 10) },
        (_, i) => ids.slice(i * 10, i * 10 + 10),
      );
      const details = await Promise.all(
        batches.map((b) =>
          get(
            `${API}/user/batch_avatar_detail_v2?uid=${uid}&region=prod_gf_cn`,
            {
              method: "POST",
              headers: { "x-rpc-device_fp": fp },
              body: JSON.stringify({ avatar_list: b }),
            },
          ),
        ),
      );

      const payload = details.flatMap((r) =>
        r.data.list.map(({ name: n, equip: e }) => ({
          [n]: (e || []).map(({ main_properties: m, properties: p }) => ({
            main: m?.[0] ? { name: m[0].property_name, add: m[0].add } : null,
            sub: p?.map((x) => ({ name: x.property_name, add: x.add })) || [],
          })),
        })),
      );

      if (window.opener) {
        window.opener.postMessage(
          { type: "nap-data", payload, uid, timestamp: Date.now() },
          TARGET_ORIGIN,
        );
        toast(
          `成功！已发送 ${payload.length} 个角色的装备数据，请切换回原分析页面查看`,
          "success",
        );
      } else {
        throw new Error("未找到来源页面（请从分析站点点击书签打开）");
      }

      window._napRunning = false;
    })
    .catch((e) => {
      toast(e.message, "error");
      console.error(e);
      window._napRunning = false;
    });
})();
