// 角色头像映射表
// 将JSON数据中的角色名称映射到对应的头像图片文件名
// 图片来源：绝区零游戏及官网，遵循 CC BY-NC-SA 4.0 协议
// 图片位置：/workbench-img/agents/
export const characterAvatarMap: Record<string, string> = {
  '照': 'xiaozhao.jpg',
  '叶瞬光': 'yeshunguang.jpg',
  '悠真': 'harumasa.jpg',
  '妮可': 'nicole-demara.jpg',
};

export function getCharacterAvatarUrl(characterName: string): string {
  const avatarFileName = characterAvatarMap[characterName];
  if (avatarFileName) {
    return `/workbench-img/agents/${avatarFileName}`;
  }
  return '/workbench-img/agents/default-avatar.jpg';
}

// 获取所有已配置头像的角色名称列表
export function getAvataredCharacters(): string[] {
  return Object.keys(characterAvatarMap);
}
