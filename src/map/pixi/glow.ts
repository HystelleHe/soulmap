import { Texture } from 'pixi.js'

// 预渲染一张"白色柔光"径向渐变纹理，按节点颜色 tint、按亮度缩放复用。
// 比给每个 sprite 挂 GlowFilter 便宜得多，几千颗星也能 60fps；
// 配合 additive 混合，叠加处的光会自然相加，像真实星光。
export function makeGlowTexture(size = 256): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const c = size / 2
  const g = ctx.createRadialGradient(c, c, 0, c, c, c)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.16, 'rgba(255,255,255,0.6)')
  g.addColorStop(0.42, 'rgba(255,255,255,0.16)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return Texture.from(canvas)
}

// 一张实心圆点（硬边 + 极薄抗锯齿软边），用作节点"实心内核"
export function makeDiscTexture(size = 128): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const c = size / 2
  const g = ctx.createRadialGradient(c, c, 0, c, c, c)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.8, 'rgba(255,255,255,1)')
  g.addColorStop(0.93, 'rgba(255,255,255,0.9)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return Texture.from(canvas)
}
