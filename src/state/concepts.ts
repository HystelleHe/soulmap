// ============ 道理概念图谱 ============
// 把预设道理按主题分成几个"色簇"，并预先织一张"隐含关系网"（暗线），
// 让地图一打开就有 Obsidian graph 那种富网感；用户亲手连的航程则是亮线。

/** 主题分类：每个类别一种色彩家族 */
export const CATEGORIES = {
  mind: { name: '心性', color: 0xffc06a }, // 暖金
  conduct: { name: '处世', color: 0xff9a6b }, // 珊瑚橙
  relation: { name: '关系', color: 0x7fe0ff }, // 青
  self: { name: '自我', color: 0xb58bff }, // 紫
  emotion: { name: '情感', color: 0xff84b0 }, // 玫瑰
  explore: { name: '探索', color: 0x9ad8ff }, // 自定义节点默认（极光蓝）
} as const

export type CategoryId = keyof typeof CATEGORIES

/** 每个预设道理 → 所属主题 */
export const WORD_CATEGORY: Record<string, CategoryId> = {
  // 心性
  知足: 'mind', 随缘: 'mind', 豁达: 'mind', 从容: 'mind', 简单: 'mind',
  平常心: 'mind', 释然: 'mind', 淡泊: 'mind', 放下: 'mind', 自然: 'mind',
  平和: 'mind', 舍得: 'mind', 接受: 'mind', 乐观: 'mind', 希望: 'mind',
  // 处世
  诚信: 'conduct', 正直: 'conduct', 节制: 'conduct', 坚持: 'conduct', 勤奋: 'conduct',
  自律: 'conduct', 务实: 'conduct', 专注: 'conduct', 果断: 'conduct', 细致: 'conduct',
  变通: 'conduct', 责任: 'conduct', 积累: 'conduct', 适应: 'conduct', 活在当下: 'conduct',
  // 关系
  感恩: 'relation', 善良: 'relation', 谦逊: 'relation', 宽容: 'relation', 尊重: 'relation',
  理解: 'relation', 真诚: 'relation', 分享: 'relation', 合作: 'relation', 包容: 'relation',
  付出: 'relation', 沟通: 'relation', 陪伴: 'relation',
  // 自我
  健康: 'self', 珍惜: 'self', 学习: 'self', 反思: 'self', 勇气: 'self',
  自由: 'self', 平衡: 'self',
  // 情感
  爱: 'emotion', 孤独: 'emotion', 遗憾: 'emotion', 离别: 'emotion',
}

/** 隐含关系网：道理之间本来就相关的暗线（按词写，渲染时转成节点 id） */
export const RELATIONS: [string, string][] = [
  ['知足', '感恩'], ['知足', '淡泊'], ['知足', '活在当下'],
  ['随缘', '放下'], ['放下', '释然'], ['释然', '从容'], ['从容', '平和'],
  ['平和', '平常心'], ['平常心', '淡泊'], ['豁达', '宽容'], ['宽容', '包容'],
  ['包容', '理解'], ['理解', '尊重'], ['尊重', '谦逊'], ['谦逊', '善良'],
  ['善良', '付出'], ['付出', '分享'], ['分享', '合作'], ['合作', '沟通'],
  ['沟通', '陪伴'], ['陪伴', '爱'], ['爱', '珍惜'], ['珍惜', '感恩'],
  ['诚信', '正直'], ['正直', '责任'], ['责任', '坚持'], ['坚持', '勤奋'],
  ['勤奋', '自律'], ['自律', '节制'], ['节制', '务实'], ['务实', '专注'],
  ['专注', '细致'], ['细致', '果断'], ['果断', '变通'], ['变通', '适应'],
  ['适应', '随缘'], ['学习', '积累'], ['积累', '坚持'], ['学习', '反思'],
  ['反思', '理解'], ['健康', '平衡'], ['平衡', '节制'], ['自由', '放下'],
  ['自由', '勇气'], ['勇气', '坚持'], ['孤独', '自由'], ['孤独', '释然'],
  ['遗憾', '释然'], ['离别', '遗憾'], ['离别', '陪伴'], ['活在当下', '珍惜'],
  ['简单', '自然'], ['自然', '随缘'], ['希望', '乐观'], ['乐观', '从容'],
  ['舍得', '放下'], ['接受', '释然'], ['感恩', '善良'],
]
