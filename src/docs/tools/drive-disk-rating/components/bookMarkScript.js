javascript: (async function () {
  const API_BASE = "https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool";
  const API_LOGIN = "https://api-takumi.mihoyo.com/common/badge/v1/login/info";
  const cleanText = (t) => t?.replace(/<[^>]*>/g, "").replace(/\\n/g, "") || "";
  const fetchJSON = (t, e) =>
    fetch(t, { credentials: "include", ...e }).then((t) => t.json());
  const getGameUID = async () => {
    try {
      return (await fetchJSON(`${API_LOGIN}?game_biz=nap_cn&lang=zh-cn`)).data
        ?.game_uid;
    } catch (e) {
      console.error("获取UID失败:", e);
      return null;
    }
  };
  const getDeviceFP = () => document.cookie.match(/DEVICEFP=(\\w+)/)?.[1];
  const getBasicList = (t, e) =>
    fetchJSON(`${API_BASE}/user/avatar_basic_list?uid=${t}&region=prod_gf_cn`, {
      headers: { "x-rpc-device_fp": e },
    });
  const getEquipBatch = (t, e, o) =>
    fetchJSON(
      `${API_BASE}/user/batch_avatar_detail_v2?uid=${t}&region=prod_gf_cn`,
      {
        method: "POST",
        headers: { "x-rpc-device_fp": o },
        body: JSON.stringify({ avatar_list: e }),
      },
    );
  const processEquipData = ({ avatar: t, equip: e, weapon: o }) => ({
    characterName: t.name_mi18n,
    characterFullName: t.full_name_mi18n,
    level: t.level,
    profession: t.avatar_profession,
    driveDiscs:
      e?.map(
        ({
          level: t,
          name: e,
          icon: o,
          rarity: a,
          invalid_property_cnt: i,
          equipment_type: s,
          properties: r,
          main_properties: n,
          equip_suit: c,
        }) => ({
          position: s,
          name: e,
          level: t,
          rarity: a,
          invalidProperty: i,
          mainProperty: { name: n[0].property_name, val: n[0].base },
          subProperties: r.map(
            ({ property_name: t, base: e, level: o, valid: a, add: i }) => ({
              name: t,
              val: e,
              level: o,
              valid: a,
              add: i,
            }),
          ),
          suit: { name: c.name, desc1: c.desc1, desc2: cleanText(c.desc2) },
        }),
      ) || [],
  });
  (async function () {
    try {
      const uid = await getGameUID();
      const device_fp = getDeviceFP();
      if (!uid || !device_fp) {
        console.error("❌ 无法读取 UID 或 DEVICEFP，可能未登录！");
        return;
      }
      console.log("✅ 开始获取角色数据，UID:", uid);
      const basicData = await getBasicList(uid, device_fp);
      const avatarList = basicData.data.list
        .filter((t) => t.unlocked)
        .map((t) => ({ avatar_id: t.avatar.id }));
      console.log(`📋找到${avatarList.length}位已解锁角色`);
      const batches = [];
      for (let t = 0; t < avatarList.length; t += 10)
        batches.push(avatarList.slice(t, t + 10));
      console.log(`🔄分${batches.length}批请求，每批最多10个角色`);
      const detailResponses = await Promise.all(
        batches.map((batch, index) => {
          console.log(`正在处理第${index + 1}/${batches.length}批...`);
          return getEquipBatch(uid, batch, device_fp);
        }),
      );
      const allResults = detailResponses.flatMap((t) =>
        t.data.list.map(processEquipData),
      );
      const result = allResults.map((t) => ({
        ...t,
        driveDiscs: t.driveDiscs.map((d) => ({
          ...d,
          mainProperty: {
            name: d.mainProperty.name,
            value: d.mainProperty.val.toString(),
          },
          subProperties: d.subProperties.map((s) => ({
            ...s,
            value: s.val.toString(),
          })),
        })),
      }));
      console.log(`✅成功提取${result.length}个角色的数据`);
      const dataKey = "ZZZ_DRIVE_DISC_DATA";
      const timestamp = Date.now();
      const payload = { data: result, timestamp: timestamp };
      localStorage.setItem(dataKey, JSON.stringify(payload));
      console.log("💾 数据已保存到 localStorage，key:", dataKey);
      console.log(
        "✅ 数据已提取完成！\n\n请返回驱动盘评分页面查看\n\n（数据已保存到 localStorage）",
      );
      console.log(
        `🔍可在控制台输入：localStorage.getItem('ZZZ_DRIVE_DISC_DATA');`,
      );
    } catch (e) {
      console.error("脚本执行出错:", e);
      console.log("❌ 执行出错：" + e.message);
    }
  });
})();
