import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
} from 'd3-force'

export interface FNode {
  id: string
  x: number
  y: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
  degree: number
}
export interface FLink {
  source: string
  target: string
}

// d3-force 力导向布局：节点互斥、连线拉拢、防重叠、轻微聚心。
// 节点对象被 d3 原地改写 x/y，Pixi 每帧读取它们的位置。
export class ForceGraph {
  private sim: Simulation<FNode, undefined>
  private map = new Map<string, FNode>()
  private tickCb?: () => void

  constructor() {
    this.sim = forceSimulation<FNode>([])
      .force('charge', forceManyBody<FNode>().strength(-185).distanceMax(1100))
      .force('x', forceX(0).strength(0.05))
      .force('y', forceY(0).strength(0.05))
      .force(
        'collide',
        forceCollide<FNode>()
          .radius((d) => 30 + d.degree * 3.5)
          .strength(0.9),
      )
      .alphaDecay(0.022)
      .velocityDecay(0.42)
      .on('tick', () => this.tickCb?.())
  }

  onTick(cb: () => void) {
    this.tickCb = cb
  }

  pos(id: string): FNode | undefined {
    return this.map.get(id)
  }

  /** 设置/更新图，复用已有节点位置以保持稳定 */
  setGraph(nodes: { id: string; x: number; y: number; degree: number }[], links: FLink[]) {
    const next: FNode[] = nodes.map((n) => {
      const prev = this.map.get(n.id)
      if (prev) {
        prev.degree = n.degree
        return prev
      }
      return { id: n.id, x: n.x, y: n.y, degree: n.degree }
    })
    this.map = new Map(next.map((n) => [n.id, n]))
    this.sim.nodes(next)
    this.sim.force(
      'link',
      forceLink<FNode, FLink>(links.map((l) => ({ ...l })))
        .id((d) => d.id)
        .distance(92)
        .strength(0.14),
    )
    this.sim.alpha(0.9).restart()
  }

  dragStart() {
    this.sim.alphaTarget(0.3).restart()
  }
  dragMove(id: string, x: number, y: number) {
    const n = this.map.get(id)
    if (n) {
      n.fx = x
      n.fy = y
    }
  }
  dragEnd(id: string) {
    const n = this.map.get(id)
    if (n) {
      n.fx = null
      n.fy = null
    }
    this.sim.alphaTarget(0)
  }

  stop() {
    this.sim.stop()
  }
}
