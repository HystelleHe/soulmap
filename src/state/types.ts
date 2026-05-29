// ============ 心屿核心数据模型 ============

/** 心情标签 */
export type Mood = '平静' | '释然' | '遗憾' | '喜悦' | '怅然' | '坚定'

export const MOODS: Mood[] = ['平静', '释然', '喜悦', '坚定', '怅然', '遗憾']

/** 道理节点：散布在无限世界坐标系里的一颗星 */
export interface SoulNode {
  id: string
  label: string
  /** preset=预设大道理；custom=用户拓展疆土 */
  type: 'preset' | 'custom'
  /** 主题分类 id（决定色簇），见 concepts.ts 的 CATEGORIES */
  category: string
  /** 力导向布局的初始世界坐标（运行时由 d3-force 接管并更新） */
  x: number
  y: number
  createdAt: number
}

/** 一条感悟记录：写下它即点亮对应节点 */
export interface Insight {
  id: string
  nodeId: string
  text: string
  mood: Mood
  createdAt: number
}

/** 航程：两个道理之间的心路连线（Phase 5） */
export interface Voyage {
  id: string
  fromId: string
  toId: string
  note: string
  createdAt: number
}
