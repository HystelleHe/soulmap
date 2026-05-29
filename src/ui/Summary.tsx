import { useMemo } from 'react'
import { useStore } from '../state/store'
import { CATEGORIES, type CategoryId } from '../state/concepts'
import { MOODS } from '../state/types'
import { downloadShareCard } from '../state/shareCard'

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')

interface Props {
  open: boolean
  onClose: () => void
}

// 旅程总结：点亮统计 + 最亮道理 + 心绪分布 + 近 30 日热力 + 导出分享卡片
export function Summary({ open, onClose }: Props) {
  const nodes = useStore((s) => s.nodes)
  const insights = useStore((s) => s.insights)
  const voyages = useStore((s) => s.voyages)

  const stats = useMemo(() => {
    const nodeById = new Map(nodes.map((n) => [n.id, n]))
    const litIds = new Set(insights.map((i) => i.nodeId))
    const litCount = nodes.filter((n) => litIds.has(n.id)).length
    const custom = nodes.filter((n) => n.type === 'custom').length

    // 各节点感悟数
    const byNode = new Map<string, number>()
    for (const i of insights) byNode.set(i.nodeId, (byNode.get(i.nodeId) || 0) + 1)
    const top = [...byNode.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, c]) => ({ node: nodeById.get(id)!, count: c }))
      .filter((x) => x.node)

    // 心绪分布
    const moods = new Map<string, number>()
    for (const i of insights) moods.set(i.mood, (moods.get(i.mood) || 0) + 1)

    // 近 30 日热力
    const days: number[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let k = 29; k >= 0; k--) {
      const start = today.getTime() - k * 86400000
      const end = start + 86400000
      days.push(insights.filter((i) => i.createdAt >= start && i.createdAt < end).length)
    }
    const maxDay = Math.max(1, ...days)

    const recent = [...insights].sort((a, b) => b.createdAt - a.createdAt)[0]
    return { litCount, custom, top, moods, days, maxDay, recent, nodeById }
  }, [nodes, insights])

  if (!open) return null

  function share() {
    const r = stats.recent
    if (!r) return
    const node = stats.nodeById.get(r.nodeId)
    if (!node) return
    const cat = CATEGORIES[node.category as CategoryId] ?? CATEGORIES.mind
    const d = new Date(r.createdAt)
    downloadShareCard({
      label: node.label,
      text: r.text,
      mood: r.mood,
      dateText: `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`,
      litCount: stats.litCount,
      accent: hex(cat.color),
    })
  }

  const statCells = [
    { v: `${stats.litCount}/${nodes.length}`, l: '已点亮' },
    { v: insights.length, l: '感悟' },
    { v: stats.custom, l: '疆土' },
    { v: voyages.length, l: '航程' },
  ]

  return (
    <>
      <div className="fixed inset-0 z-20 bg-black/30 anim-fade" onClick={onClose} />
      <aside
        className="glass anim-rise fixed z-30 flex flex-col
          inset-x-0 bottom-0 max-h-[86vh] rounded-t-[28px]
          sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[440px] sm:max-h-none sm:rounded-t-none sm:rounded-l-[28px]"
      >
        <header className="flex items-start justify-between gap-4 px-7 pt-7 pb-2">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--ink)' }}>
              旅程总结
            </h2>
            <p className="mt-1 text-[12px]" style={{ color: 'var(--ink-faint)' }}>
              你的认知星海，至今的轨迹
            </p>
          </div>
          <button
            onClick={onClose}
            className="-mr-1 grid h-9 w-9 place-items-center rounded-full text-lg transition hover:bg-white/10"
            style={{ color: 'var(--ink-soft)' }}
            aria-label="关闭"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-7 pb-8">
          {/* 四项统计 */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {statCells.map((s) => (
              <div
                key={s.l}
                className="rounded-2xl bg-white/[0.03] py-3 text-center"
                style={{ border: '1px solid var(--line)' }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--ink)' }}>
                  {s.v}
                </div>
                <div className="mt-0.5 text-[10px]" style={{ color: 'var(--ink-faint)' }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          {/* 最亮的道理 */}
          {stats.top.length > 0 && (
            <section className="mt-7">
              <h3 className="mb-3 text-[12px] tracking-[0.2em]" style={{ color: 'var(--ink-faint)' }}>
                最亮的道理
              </h3>
              <ul className="space-y-2">
                {stats.top.map(({ node, count }) => {
                  const c = hex((CATEGORIES[node.category as CategoryId] ?? CATEGORIES.mind).color)
                  return (
                    <li key={node.id} className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: c, boxShadow: `0 0 10px ${c}` }}
                      />
                      <span style={{ color: 'var(--ink)' }}>{node.label}</span>
                      <span className="ml-auto text-[13px]" style={{ color: 'var(--ink-faint)' }}>
                        {count} 则
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* 心绪分布 */}
          <section className="mt-7">
            <h3 className="mb-3 text-[12px] tracking-[0.2em]" style={{ color: 'var(--ink-faint)' }}>
              心绪分布
            </h3>
            <div className="space-y-2">
              {MOODS.map((m) => {
                const c = stats.moods.get(m) || 0
                const pct = insights.length ? (c / insights.length) * 100 : 0
                return (
                  <div key={m} className="flex items-center gap-3 text-[13px]">
                    <span className="w-10 shrink-0" style={{ color: 'var(--ink-soft)' }}>
                      {m}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: 'var(--color-amber-glow)', opacity: 0.7 }}
                      />
                    </div>
                    <span className="w-6 text-right" style={{ color: 'var(--ink-faint)' }}>
                      {c}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 近 30 日热力 */}
          <section className="mt-7">
            <h3 className="mb-3 text-[12px] tracking-[0.2em]" style={{ color: 'var(--ink-faint)' }}>
              近 30 日点亮
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {stats.days.map((c, i) => (
                <div
                  key={i}
                  className="h-4 w-4 rounded-[4px]"
                  title={`${c} 则`}
                  style={{
                    background: c
                      ? 'var(--color-amber-glow)'
                      : 'rgba(255,255,255,0.05)',
                    opacity: c ? 0.3 + 0.7 * (c / stats.maxDay) : 1,
                  }}
                />
              ))}
            </div>
          </section>

          {/* 分享 */}
          <button
            onClick={share}
            disabled={!stats.recent}
            className="mt-8 w-full rounded-2xl py-3.5 text-[15px] font-medium tracking-wide transition disabled:opacity-30"
            style={{ background: 'var(--color-amber-glow)', color: '#0a0d16' }}
          >
            导出分享卡片
          </button>
          <p className="mt-2 text-center text-[11px]" style={{ color: 'var(--ink-faint)' }}>
            以最近一则感悟生成一张极简星图卡片
          </p>
        </div>
      </aside>
    </>
  )
}
