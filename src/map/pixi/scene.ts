import { Application, Container, Graphics, Sprite } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import type { SoulNode } from '../../state/types'
import type { Level } from '../../state/brightness'
import { Starfield } from './starfield'
import { NodeView } from './nodeSprite'
import { makeDiscTexture, makeGlowTexture } from './glow'
import { nodeColors, PIXI_COLORS } from './theme'
import { ForceGraph } from './forceLayout'

export interface EdgeInput {
  source: string
  target: string
  kind: 'relation' | 'voyage'
}

export interface GraphData {
  nodes: SoulNode[]
  edges: EdgeInput[]
  levelOf: (id: string) => Level
  litOf: (id: string) => boolean
}

// 力导向概念星图场景：相机 + 星空 + 连线网 + 节点。
export class MapScene {
  readonly app = new Application()
  private host: HTMLElement
  private viewport!: Viewport
  private starfield!: Starfield
  private edgeGfx = new Graphics() // 连线层（每帧重绘）
  private nodeLayer = new Container()
  private fxLayer = new Container()
  private views = new Map<string, NodeView>()
  private force = new ForceGraph()
  private edges: EdgeInput[] = []
  private adjacency = new Map<string, Set<string>>()
  private litOf: (id: string) => boolean = () => false
  private highlightId: string | null = null
  private glowTex = makeGlowTexture()
  private discTex = makeDiscTexture()
  private t = 0
  private onTap?: (id: string) => void
  private destroyed = false

  constructor(host: HTMLElement) {
    this.host = host
  }

  async init() {
    const w = this.host.clientWidth || window.innerWidth
    const h = this.host.clientHeight || window.innerHeight

    await this.app.init({
      resizeTo: this.host,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      autoDensity: true,
      preference: 'webgl',
    })
    if (this.destroyed) {
      this.app.destroy()
      return
    }
    this.host.appendChild(this.app.canvas)

    this.starfield = new Starfield(w, h)
    this.app.stage.addChild(this.starfield.container)

    this.viewport = new Viewport({
      screenWidth: w,
      screenHeight: h,
      worldWidth: 100000,
      worldHeight: 100000,
      events: this.app.renderer.events,
    })
    this.viewport
      .drag({ mouseButtons: 'all' })
      .pinch()
      .wheel({ smooth: 4 })
      .decelerate({ friction: 0.92 })
      .clampZoom({ minScale: 0.18, maxScale: 2.6 })
    this.app.stage.addChild(this.viewport)

    this.viewport.addChild(this.edgeGfx)
    this.viewport.addChild(this.nodeLayer)
    this.viewport.addChild(this.fxLayer)

    this.viewport.setZoom(0.62, true)
    this.viewport.moveCenter(0, 0)

    // 每帧：同步力导向位置 + 重绘连线 + 星空视差 + 星辰呼吸 + 标签随缩放淡入淡出
    this.app.ticker.add((ticker) => {
      this.t += ticker.deltaMS / 1000
      this.syncPositions()
      this.drawEdges()
      const c = this.viewport.center
      this.starfield.update(c.x, c.y)
      // 默认缩放(0.62)文字清晰；明显拉远(<0.6)才渐隐，只剩拓扑
      const z = this.viewport.scale.x
      const f = Math.max(0, Math.min(1, (z - 0.42) / 0.18))
      const labelFactor = f * f * (3 - 2 * f)
      for (const v of this.views.values()) v.frame(this.t, labelFactor)
    })

    window.addEventListener('resize', this.handleResize)
  }

  private handleResize = () => {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    this.viewport.resize(w, h)
    this.starfield.resize(w, h)
  }

  setOnTap(cb: (id: string) => void) {
    this.onTap = cb
  }

  /** 喂入完整图数据（节点 + 连线 + 亮度查询） */
  setData(data: GraphData) {
    this.litOf = data.litOf

    // 邻接表 + 度数
    this.edges = data.edges
    this.adjacency = new Map()
    const degree = new Map<string, number>()
    for (const e of data.edges) {
      if (!this.adjacency.has(e.source)) this.adjacency.set(e.source, new Set())
      if (!this.adjacency.has(e.target)) this.adjacency.set(e.target, new Set())
      this.adjacency.get(e.source)!.add(e.target)
      this.adjacency.get(e.target)!.add(e.source)
      degree.set(e.source, (degree.get(e.source) || 0) + 1)
      degree.set(e.target, (degree.get(e.target) || 0) + 1)
    }

    // 节点视图增删 + 外观刷新
    const seen = new Set<string>()
    for (const n of data.nodes) {
      seen.add(n.id)
      let v = this.views.get(n.id)
      if (!v) {
        v = new NodeView({
          glowTex: this.glowTex,
          discTex: this.discTex,
          label: n.label,
          category: n.category,
        })
        const id = n.id
        v.container.on('pointertap', () => this.onTap?.(id))
        v.container.on('pointerover', () => this.setHighlight(id))
        v.container.on('pointerout', () => this.setHighlight(null))
        this.nodeLayer.addChild(v.container)
        this.views.set(id, v)
      }
      v.apply(data.levelOf(n.id), data.litOf(n.id), degree.get(n.id) || 0)
    }
    for (const [id, v] of this.views) {
      if (!seen.has(id)) {
        v.container.destroy({ children: true })
        this.views.delete(id)
      }
    }

    // 更新力导向图
    this.force.setGraph(
      data.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, degree: degree.get(n.id) || 0 })),
      data.edges.map((e) => ({ source: e.source, target: e.target })),
    )
  }

  private syncPositions() {
    for (const [id, v] of this.views) {
      const p = this.force.pos(id)
      if (p) v.container.position.set(p.x, p.y)
    }
  }

  private drawEdges() {
    const g = this.edgeGfx
    g.clear()
    const hl = this.highlightId
    for (const e of this.edges) {
      const a = this.force.pos(e.source)
      const b = this.force.pos(e.target)
      if (!a || !b) continue
      const touchesHl = hl ? e.source === hl || e.target === hl : false
      const bothLit = this.litOf(e.source) && this.litOf(e.target)

      let color: number
      let width: number
      let alpha: number
      if (e.kind === 'voyage') {
        color = PIXI_COLORS.voyageLine
        width = 2.8
        alpha = 0.72
      } else {
        // 隐含关系网：常态可见的暗线；两端都点亮则更亮
        color = PIXI_COLORS.relationLine
        width = 1.7
        alpha = bothLit ? 0.5 : 0.26
      }
      if (hl) alpha = touchesHl ? Math.min(1, alpha + 0.4) : alpha * 0.22

      // 轻微弧度：控制点沿中点法线偏移，弯向由两端 id 决定（稳定且有变化）
      const dx = b.x - a.x
      const dy = b.y - a.y
      const len = Math.hypot(dx, dy) || 1
      const bow = ((e.source.length + e.target.length) % 2 ? 1 : -1) * len * 0.1
      const mx = (a.x + b.x) / 2 + (-dy / len) * bow
      const my = (a.y + b.y) / 2 + (dx / len) * bow

      // 柔光：先画一层更宽更淡的光晕，再画清晰的细芯 → 线条柔软不生硬
      g.moveTo(a.x, a.y).quadraticCurveTo(mx, my, b.x, b.y)
      g.stroke({ width: width * 2.6, color, alpha: alpha * 0.32, cap: 'round' })
      g.moveTo(a.x, a.y).quadraticCurveTo(mx, my, b.x, b.y)
      g.stroke({ width, color, alpha, cap: 'round' })
    }
  }

  private setHighlight(id: string | null) {
    this.highlightId = id
    if (id === null) {
      for (const v of this.views.values()) v.setDimmed(false)
      return
    }
    const neigh = this.adjacency.get(id)
    for (const [vid, v] of this.views) {
      v.setDimmed(!(vid === id || (neigh?.has(vid) ?? false)))
    }
  }

  /** 点亮特效：扩散光环 */
  pulse(nodeId: string) {
    const v = this.views.get(nodeId)
    const p = this.force.pos(nodeId)
    if (!v || !p) return
    const ring = new Sprite(this.glowTex)
    ring.anchor.set(0.5)
    ring.blendMode = 'add'
    ring.tint = nodeColors(v.category, true).glow
    ring.position.set(p.x, p.y)
    this.fxLayer.addChild(ring)
    let life = 0
    const tick = (ticker: { deltaMS: number }) => {
      life += ticker.deltaMS / 700
      if (life >= 1) {
        this.app.ticker.remove(tick)
        ring.destroy()
        return
      }
      const e = 1 - Math.pow(1 - life, 3)
      ring.scale.set(0.2 + e * 1.7)
      ring.alpha = (1 - life) * 0.9
    }
    this.app.ticker.add(tick)
  }

  focusNode(nodeId: string) {
    const p = this.force.pos(nodeId)
    if (!p) return
    this.viewport.animate({
      time: 900,
      position: { x: p.x, y: p.y },
      scale: Math.max(this.viewport.scale.x, 1.0),
      ease: 'easeInOutSine',
    })
  }

  recenter() {
    this.viewport.animate({
      time: 850,
      position: { x: 0, y: 0 },
      scale: 0.62,
      ease: 'easeInOutSine',
    })
  }

  destroy() {
    this.destroyed = true
    window.removeEventListener('resize', this.handleResize)
    this.force.stop()
    try {
      this.app.destroy(true, { children: true })
    } catch {
      /* 已销毁则忽略 */
    }
  }
}
