import { Circle, Container, Sprite, Text, Texture } from 'pixi.js'
import { LEVEL_META, type Level } from '../../state/brightness'
import { categoryColor, nodeColors } from './theme'

export interface NodeViewOpts {
  glowTex: Texture
  discTex: Texture
  label: string
  category: string
}

// 一颗道理星辰：实心彩点(core) + 外围微微发光(glow) + 标签。
// 标签轻量、染节点色柔光、随缩放淡入淡出，融入拓扑而不突兀。
export class NodeView {
  readonly container = new Container()
  category: string
  level: Level = 0
  lit = false

  private glow: Sprite
  private core: Sprite
  private text: Text
  private phase = Math.random() * Math.PI * 2
  private baseLabelAlpha = 0.8
  private hovered = false

  constructor(o: NodeViewOpts) {
    this.category = o.category

    this.glow = new Sprite(o.glowTex)
    this.glow.anchor.set(0.5)
    this.glow.blendMode = 'add'

    this.core = new Sprite(o.discTex)
    this.core.anchor.set(0.5)

    this.text = new Text({
      text: o.label,
      style: {
        fontFamily: '"Noto Serif SC", serif',
        fontSize: 20,
        fontWeight: '300',
        fill: 0xffffff,
        letterSpacing: 3,
      },
    })
    this.text.anchor.set(0.5, 0)
    this.text.resolution = Math.min(3, (window.devicePixelRatio || 1) * 1.5)
    this.text.y = 14

    this.container.addChild(this.glow, this.core, this.text)
    this.container.eventMode = 'static'
    this.container.cursor = 'pointer'
    this.container.hitArea = new Circle(0, 12, 54)

    this.apply(0, false, 0)
  }

  private sizeFactor(degree: number) {
    return 1 + Math.min(degree, 8) * 0.12
  }

  apply(level: Level, lit: boolean, degree: number) {
    this.level = level
    this.lit = lit
    const m = LEVEL_META[level]
    const c = nodeColors(this.category, lit)
    const cc = categoryColor(this.category)
    const sf = this.sizeFactor(degree)

    this.glow.scale.set(m.glow * 0.3 * sf)
    this.glow.tint = c.glow
    this.glow.alpha = lit ? 0.85 : 0.32

    const coreRadius = (4.6 + level * 1.2) * sf
    this.core.scale.set(coreRadius / 64)
    this.core.tint = c.core
    this.core.alpha = lit ? 1 : 0.95

    // 标签：轻量 + 节点同色柔光（像星辰透出的名字）
    this.text.tint = lit ? 0xffffff : 0xcdd8ec
    this.text.style.fontSize = (lit ? 21 : 19) * (0.94 + sf * 0.06)
    this.text.style.dropShadow = {
      color: cc,
      alpha: lit ? 0.7 : 0.4,
      blur: lit ? 7 : 5,
      distance: 0,
      angle: 0,
    }
    this.text.y = coreRadius + 7
    this.baseLabelAlpha = lit ? 1 : 0.78
  }

  /** 每帧：星辰呼吸 + 标签随缩放淡入淡出（labelFactor 0..1） */
  frame(t: number, labelFactor: number) {
    const base = this.lit ? 0.85 : 0.32
    const s = 0.85 + Math.sin(t * 1.3 + this.phase) * 0.15
    this.glow.alpha = base * s
    this.text.alpha = this.hovered
      ? 1
      : this.baseLabelAlpha * labelFactor
  }

  setHover(h: boolean) {
    this.hovered = h
    this.container.scale.set(h ? 1.16 : 1)
  }

  setDimmed(dim: boolean) {
    this.container.alpha = dim ? 0.28 : 1
  }
}
