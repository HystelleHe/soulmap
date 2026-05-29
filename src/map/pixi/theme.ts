import { CATEGORIES, type CategoryId } from '../../state/concepts'

// Pixi 渲染用的颜色（与 index.css 的设计令牌保持一致）
export const PIXI_COLORS = {
  // 未点亮：冷迷雾（调亮，便于和背景星星区分）
  mist: 0x90a6cc,
  mistCore: 0xc2d2ee,
  // 连线
  relationLine: 0x7488b0, // 隐含关系网：暗
  voyageLine: 0xffd9a0, // 个人航程：亮
}

/** 取某分类的色簇颜色 */
export function categoryColor(category: string): number {
  return (CATEGORIES[category as CategoryId] ?? CATEGORIES.mind).color
}

/**
 * 节点配色：始终用主题色簇（未点亮也带暗色，形成色簇区域，像 Obsidian），
 * 点亮后内核变白、整体大幅增亮（见 nodeSprite 的 alpha/尺寸）。
 */
export function nodeColors(category: string, lit: boolean) {
  const c = categoryColor(category)
  return { glow: c, core: lit ? 0xffffff : c, ring: c }
}
