import type { Insight } from './types'

// ============ 亮度模型：brightness = f(记录条数, 总字数) ============
// v1 不做时间衰减，只做正向激励：记得越多、写得越深，光越亮。

export type Level = 0 | 1 | 2 | 3 | 4

/** 每个亮度等级的名称与视觉参数（供 Pixi 渲染读取） */
export const LEVEL_META: Record<
  Level,
  { name: string; glow: number; core: number; coreAlpha: number; label: string }
> = {
  0: { name: '迷雾', glow: 0.52, core: 3.8, coreAlpha: 0.66, label: '尚未点亮' },
  1: { name: '微光', glow: 0.95, core: 4.0, coreAlpha: 0.9, label: '微光' },
  2: { name: '烛光', glow: 1.45, core: 5.2, coreAlpha: 1.0, label: '烛光' },
  3: { name: '灯塔', glow: 2.1, core: 6.6, coreAlpha: 1.0, label: '灯塔' },
  4: { name: '恒星', glow: 3.0, core: 8.4, coreAlpha: 1.0, label: '恒星' },
}

/** 根据一个节点的所有感悟，算出亮度等级 0-4 */
export function levelFromInsights(insights: Insight[]): Level {
  if (insights.length === 0) return 0
  const count = insights.length
  const chars = insights.reduce((s, i) => s + i.text.trim().length, 0)
  // 条数或字数任一达到阈值即升级，鼓励"多记"或"写深"两条路径
  if (count >= 10 || chars >= 1200) return 4
  if (count >= 6 || chars >= 500) return 3
  if (count >= 3 || chars >= 150) return 2
  return 1
}
