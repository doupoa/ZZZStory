// 共享角色配置文件

// 角色颜色配置接口
export interface RoleColorConfig {
  color: string;
  background: string;
}

// 角色阵营配置
export interface RoleCampConfig {
  [roleName: string]: [string, string]; // [color, background]
}

// 角色配置接口
export interface RoleConfig {
  [campName: string]: RoleCampConfig;
}

// 角色CSS类名映射，可以为后续重要角色添加特殊的边框、阴影或动画效果
export interface RoleClassMap {
  [roleName: string]: string;
}

/* 在绳网情报站角色界面通过以下js获取主题色 */
/* document.getElementsByClassName("entry-scroll")[0].style.cssText.replace(";","").split(": ")[1] */
/*格式:'安比': ['#b3cc58', '#C8E16C33']   [角色颜色, 背景颜色]*/
/* 背景色直接通过主色加33(20%透明度) */

// 角色配置导出   
export const rolesConfig: RoleConfig = {
  random_play: {
    //录像店
    '铃': ['#254fff', '#fd802dbf'],
    '哲': ['#ffffff', '#fd802dbf'],
    'Fairy': ['#1e3c72', '#1e3c7233'],
    '(蓝发少女)': ['#254fff', '#fd802dbf'],
    '(灰发少年)': ['#ffffff', '#fd802dbf'],
  },

  cunning_hares: {
    //狡兔屋
    '安比': ['#b3cc58', '#C8E16C33'],
    '比利': ['#cc4f4b', '#AF3E3A33'],
    '妮可': ['#cd8583', '#E6ADAA33'],
    '猫又': ['#A0351C', '#A0351C33'],
    '(粉毛长发少女)': ['#cd8583', '#E6ADAA33'],
    '(白毛短发少女)': ['#cc4f4b', '#AF3E3A33'],
  },
  belobog_heavy_industries: {}, // 白祇重工
  sons_of_calydon: {}, // 卡吕冬之子
  mockingbird: {}, //反舌鸟

  other: { 'npc': ['dodgerblue', '#7c7c7c46'] }, //其他角色
};

// 角色CSS类名映射
export const roleClassMap: RoleClassMap = {
};

// 获取角色颜色
export function getRoleColors(role: string): RoleColorConfig {
  const defaultColors = { color: 'dodgerblue', background: '#7c7c7c46' };
  
  for (const camp of Object.keys(rolesConfig)) {
    const campRoles = rolesConfig[camp];
    if (campRoles[role]) {
      const [color, background] = campRoles[role];
      return { color, background };
    }
  }
  
  return defaultColors;
}

// 获取角色CSS类名
export function getRoleClass(role: string): string {
  return roleClassMap[role] || '';
}

// 获取所有角色名称
export function getAllRoleNames(): string[] {
  const roleNames = new Set<string>();
  
  // 遍历所有阵营
  for (const camp of Object.keys(rolesConfig)) {
    const campRoles = rolesConfig[camp];
    // 添加该阵营的所有角色名称
    Object.keys(campRoles).forEach(role => roleNames.add(role));
  }
  
  return Array.from(roleNames).sort();
}
