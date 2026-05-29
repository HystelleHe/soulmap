import { Container, TilingSprite, Texture } from 'pixi.js'

// 生成一张随机星点贴图（用于无限平铺）
function makeStarTile(size: number, count: number, maxR: number, alpha: number): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  for (let i = 0; i < count; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * maxR + 0.3
    const a = (Math.random() * 0.6 + 0.4) * alpha
    // 偶尔给星点染一点冷暖偏色，避免死白
    const tint = Math.random()
    const col =
      tint < 0.15 ? '255,222,180' : tint > 0.85 ? '190,214,255' : '255,255,255'
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4)
    g.addColorStop(0, `rgba(${col},${a})`)
    g.addColorStop(1, `rgba(${col},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r * 2.4, 0, Math.PI * 2)
    ctx.fill()
  }
  return Texture.from(canvas)
}

// 多层视差星空：远层暗而慢、近层亮而快，随相机移动滚动 → 看起来无尽
export class Starfield {
  readonly container = new Container()
  private layers: { sprite: TilingSprite; factor: number }[] = []

  constructor(w: number, h: number) {
    // 背景星压暗、收小，避免与可点亮的节点混淆
    const defs = [
      { count: 120, maxR: 0.8, alpha: 0.32, factor: 0.12 },
      { count: 70, maxR: 1.1, alpha: 0.5, factor: 0.28 },
      { count: 28, maxR: 1.5, alpha: 0.68, factor: 0.5 },
    ]
    for (const d of defs) {
      const tex = makeStarTile(560, d.count, d.maxR, d.alpha)
      const sprite = new TilingSprite({ texture: tex, width: w, height: h })
      sprite.eventMode = 'none'
      this.container.addChild(sprite)
      this.layers.push({ sprite, factor: d.factor })
    }
  }

  resize(w: number, h: number) {
    for (const { sprite } of this.layers) {
      sprite.width = w
      sprite.height = h
    }
  }

  /** 跟随相机中心做视差滚动（世界坐标） */
  update(centerX: number, centerY: number) {
    for (const { sprite, factor } of this.layers) {
      sprite.tilePosition.set(-centerX * factor, -centerY * factor)
    }
  }
}
