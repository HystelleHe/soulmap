// ============ 节点布点几何 ============
// 用黄金角螺旋（向日葵/phyllotaxis）把道理均匀向外铺开：
// 自然、有机、不规则，且天然支持向外无限延展。

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)) // ≈ 2.39996（黄金角）

export interface Pos {
  x: number
  y: number
}

/** 第 index 个预设节点的世界坐标 */
export function spiralPosition(index: number, spacing = 165): Pos {
  const r = spacing * Math.sqrt(index + 0.7)
  const theta = index * GOLDEN_ANGLE
  return { x: Math.cos(theta) * r, y: Math.sin(theta) * r }
}

/**
 * 自定义节点（疆土拓展）的落点：放到比现有所有节点更外圈的空旷处，
 * 沿黄金角继续延伸，保证不与既有星辰重叠。
 */
export function outerPosition(seedIndex: number, spacing = 165): Pos {
  return spiralPosition(seedIndex + 4, spacing)
}
