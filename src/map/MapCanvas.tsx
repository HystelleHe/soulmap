import { useEffect, useRef } from 'react'
import { MapScene, type EdgeInput } from './pixi/scene'
import { useStore } from '../state/store'
import { levelFromInsights } from '../state/brightness'
import { RELATIONS } from '../state/concepts'
import type { Insight } from '../state/types'

interface Props {
  onSelect: (id: string) => void
  onReady?: (scene: MapScene) => void
}

// 把 Pixi 场景挂进 React，并在 store 变化时把节点 + 连线网喂给场景
export function MapCanvas({ onSelect, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<MapScene | null>(null)

  const cbRef = useRef({ onSelect, onReady })
  cbRef.current = { onSelect, onReady }

  const nodes = useStore((s) => s.nodes)
  const insights = useStore((s) => s.insights)
  const voyages = useStore((s) => s.voyages)

  function push() {
    const scene = sceneRef.current
    if (!scene) return
    const { nodes, insights, voyages } = useStore.getState()

    // 亮度分组
    const grouped: Record<string, Insight[]> = {}
    for (const ins of insights) (grouped[ins.nodeId] ||= []).push(ins)

    // 连线：隐含关系网（按词映射成 id）+ 个人航程
    const byLabel = new Map(nodes.map((n) => [n.label, n.id]))
    const edges: EdgeInput[] = []
    for (const [a, b] of RELATIONS) {
      const sa = byLabel.get(a)
      const sb = byLabel.get(b)
      if (sa && sb) edges.push({ source: sa, target: sb, kind: 'relation' })
    }
    for (const v of voyages) {
      edges.push({ source: v.fromId, target: v.toId, kind: 'voyage' })
    }

    scene.setData({
      nodes,
      edges,
      levelOf: (id) => levelFromInsights(grouped[id] || []),
      litOf: (id) => (grouped[id]?.length || 0) > 0,
    })
  }

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const scene = new MapScene(host)
    sceneRef.current = scene
    let cancelled = false
    scene.init().then(() => {
      if (cancelled) return
      scene.setOnTap((id) => cbRef.current.onSelect(id))
      cbRef.current.onReady?.(scene)
      push()
    })
    return () => {
      cancelled = true
      scene.destroy()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    push()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, insights, voyages])

  return <div ref={hostRef} className="absolute inset-0 touch-none" />
}
