import { useEffect, useMemo, useRef, useState } from 'react'
import { MapCanvas } from './map/MapCanvas'
import { NodeDetail } from './ui/NodeDetail'
import { JourneyList } from './ui/JourneyList'
import { Terra } from './ui/Terra'
import { VoyageCreator } from './ui/VoyageCreator'
import { Summary } from './ui/Summary'
import { Landing } from './ui/Landing'
import { useStore } from './state/store'
import type { MapScene } from './map/pixi/scene'

export default function App() {
  const ensureSeeded = useStore((s) => s.ensureSeeded)
  const addCustomNode = useStore((s) => s.addCustomNode)
  const addVoyage = useStore((s) => s.addVoyage)
  const nodes = useStore((s) => s.nodes)
  const insights = useStore((s) => s.insights)

  const [entered, setEntered] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [journeyOpen, setJourneyOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [terraOpen, setTerraOpen] = useState(false)
  const [voyageMode, setVoyageMode] = useState(false)
  const [voyageFrom, setVoyageFrom] = useState<string | null>(null)
  const [voyageTo, setVoyageTo] = useState<string | null>(null)
  const sceneRef = useRef<MapScene | null>(null)

  useEffect(() => {
    ensureSeeded()
  }, [ensureSeeded])

  const litCount = useMemo(() => {
    const ids = new Set(insights.map((i) => i.nodeId))
    return nodes.filter((n) => ids.has(n.id)).length
  }, [nodes, insights])

  const labelOf = (id: string | null) =>
    (id && nodes.find((n) => n.id === id)?.label) || null

  // 地图点击：航程模式下用于选起点/终点，否则打开节点详情
  function handleSelect(id: string) {
    if (!voyageMode) {
      setSelected(id)
      return
    }
    if (!voyageFrom) {
      setVoyageFrom(id)
      sceneRef.current?.pulse(id)
    } else if (id !== voyageFrom && !voyageTo) {
      setVoyageTo(id)
      sceneRef.current?.pulse(id)
    }
  }

  function startVoyage() {
    setSelected(null)
    setVoyageFrom(null)
    setVoyageTo(null)
    setVoyageMode(true)
  }
  function resetVoyage() {
    setVoyageMode(false)
    setVoyageFrom(null)
    setVoyageTo(null)
  }
  function submitVoyage(note: string) {
    if (voyageFrom && voyageTo) addVoyage(voyageFrom, voyageTo, note)
    resetVoyage()
  }

  function createCustom(label: string) {
    const node = addCustomNode(label)
    setTerraOpen(false)
    setSelected(node.id)
    // 等力导向把新星纳入后再聚焦
    setTimeout(() => sceneRef.current?.focusNode(node.id), 220)
  }

  const tools: { key: string; label: string; on?: boolean; action: () => void }[] = [
    { key: 'journey', label: '旅程', action: () => setJourneyOpen(true) },
    { key: 'summary', label: '总结', action: () => setSummaryOpen(true) },
    { key: 'terra', label: '拓展', action: () => setTerraOpen(true) },
    { key: 'voyage', label: '航程', on: voyageMode, action: () => (voyageMode ? resetVoyage() : startVoyage()) },
    { key: 'home', label: '✦', action: () => sceneRef.current?.recenter() },
  ]

  return (
    <main className="relative h-full w-full overflow-hidden">
      <MapCanvas onSelect={handleSelect} onReady={(s) => (sceneRef.current = s)} />

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 45%, transparent 52%, rgba(3,5,11,0.55) 100%)',
        }}
      />

      {/* 左上：字标 */}
      <header className="anim-fade pointer-events-none absolute left-6 top-6 z-10 select-none sm:left-9 sm:top-8">
        <h1
          className="leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(30px, 5vw, 42px)',
            letterSpacing: '0.04em',
            color: 'var(--ink)',
            textShadow: '0 0 30px rgba(127,224,255,0.25)',
          }}
        >
          心屿
        </h1>
        <p className="mt-1 text-[11px] tracking-[0.3em]" style={{ color: 'var(--ink-faint)' }}>
          SOULMAP · 心之星海
        </p>
      </header>

      {/* 右上：点亮进度 */}
      <div
        className="anim-fade absolute right-6 top-7 z-10 text-right sm:right-9 sm:top-9"
        style={{ color: 'var(--ink-soft)' }}
      >
        <div className="leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: '26px' }}>
          <span style={{ color: 'var(--color-amber-glow)' }}>{litCount}</span>
          <span className="opacity-40"> / {nodes.length}</span>
        </div>
        <p className="mt-1 text-[10px] tracking-[0.25em] opacity-70">已点亮</p>
      </div>

      {/* 底部中央：操作提示 */}
      <p
        className="anim-fade pointer-events-none absolute bottom-7 left-1/2 z-10 w-full -translate-x-1/2 px-6 text-center text-[12px] tracking-[0.18em] sm:text-[13px]"
        style={{ color: 'var(--ink-faint)' }}
      >
        拖拽漫游 · 滚轮缩放 · 轻触星辰，写下你懂得的道理
      </p>

      {/* 右下：工具栏 */}
      <div className="anim-fade absolute bottom-6 right-6 z-10 flex flex-col items-center gap-2.5 sm:right-9">
        {tools.map((t) => (
          <button
            key={t.key}
            onClick={t.action}
            className="glass grid h-12 w-12 place-items-center rounded-full text-[13px] transition hover:scale-105"
            style={{
              color: t.on ? '#0a0d16' : 'var(--ink-soft)',
              background: t.on ? 'var(--color-amber-glow)' : undefined,
              fontFamily: t.label.length > 1 ? 'var(--font-serif)' : undefined,
            }}
            title={t.key === 'home' ? '回到原点' : t.label}
          >
            {t.label}
          </button>
        ))}
      </div>

      <NodeDetail
        nodeId={voyageMode ? null : selected}
        onClose={() => setSelected(null)}
        onLit={(id) => sceneRef.current?.pulse(id)}
      />

      <JourneyList
        open={journeyOpen}
        onClose={() => setJourneyOpen(false)}
        onPick={(id) => {
          setJourneyOpen(false)
          setSelected(id)
          sceneRef.current?.focusNode(id)
        }}
      />

      <Summary open={summaryOpen} onClose={() => setSummaryOpen(false)} />

      <Terra open={terraOpen} onClose={() => setTerraOpen(false)} onCreate={createCustom} />

      <VoyageCreator
        active={voyageMode}
        fromLabel={labelOf(voyageFrom)}
        toLabel={labelOf(voyageTo)}
        onCancel={resetVoyage}
        onSubmit={submitVoyage}
      />

      {!entered && <Landing onEnter={() => setEntered(true)} />}
    </main>
  )
}
