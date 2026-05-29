import { useMemo } from 'react'
import { useStore } from '../state/store'
import { CATEGORIES, type CategoryId } from '../state/concepts'

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')

function relTime(ts: number): string {
  const d = Date.now() - ts
  if (d < 60_000) return '刚刚'
  if (d < 3_600_000) return `${Math.floor(d / 60_000)} 分钟前`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)} 小时前`
  const date = new Date(ts)
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

interface Props {
  open: boolean
  onClose: () => void
  onPick: (nodeId: string) => void
}

// 我的旅程：把所有感悟按时间倒序汇总，回顾认知成长的脉络
export function JourneyList({ open, onClose, onPick }: Props) {
  const nodes = useStore((s) => s.nodes)
  const insights = useStore((s) => s.insights)

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])
  const sorted = useMemo(
    () => [...insights].sort((a, b) => b.createdAt - a.createdAt),
    [insights],
  )
  const litCount = useMemo(
    () => new Set(insights.map((i) => i.nodeId)).size,
    [insights],
  )

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-20 bg-black/30 anim-fade" onClick={onClose} />
      <aside
        className="glass anim-rise fixed z-30 flex flex-col
          inset-x-0 bottom-0 max-h-[82vh] rounded-t-[28px]
          sm:inset-y-0 sm:left-0 sm:right-auto sm:w-[420px] sm:max-h-none sm:rounded-t-none sm:rounded-r-[28px]"
      >
        <header className="flex items-start justify-between gap-4 px-7 pt-7 pb-4">
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '34px',
                color: 'var(--ink)',
              }}
            >
              我的旅程
            </h2>
            <p className="mt-1 text-[12px]" style={{ color: 'var(--ink-faint)' }}>
              已点亮 {litCount} 座 · 共 {insights.length} 则感悟
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
          {sorted.length === 0 ? (
            <p
              className="py-10 text-center text-sm italic"
              style={{ color: 'var(--ink-faint)' }}
            >
              旅程尚未开始 · 轻触星辰，写下第一则感悟
            </p>
          ) : (
            <ul className="space-y-3">
              {sorted.map((i) => {
                const node = nodeById.get(i.nodeId)
                if (!node) return null
                const cat = CATEGORIES[node.category as CategoryId] ?? CATEGORIES.mind
                const color = hex(cat.color)
                return (
                  <li key={i.id}>
                    <button
                      onClick={() => onPick(i.nodeId)}
                      className="w-full rounded-2xl bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.07]"
                      style={{ border: '1px solid var(--line)' }}
                    >
                      <div className="mb-1.5 flex items-center gap-2 text-[12px]">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                        />
                        <span style={{ color: 'var(--ink)' }}>{node.label}</span>
                        <span style={{ color: 'var(--ink-faint)' }}>· {i.mood}</span>
                        <span style={{ color: 'var(--ink-faint)' }} className="ml-auto">
                          {relTime(i.createdAt)}
                        </span>
                      </div>
                      <p
                        className="line-clamp-2 text-[14px] leading-relaxed"
                        style={{ color: 'var(--ink-soft)' }}
                      >
                        {i.text}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
