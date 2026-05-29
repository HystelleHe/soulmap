import { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import { MOODS, type Mood } from '../state/types'
import { LEVEL_META, levelFromInsights } from '../state/brightness'
import { lightCountToday } from '../state/social'
import { CATEGORIES, type CategoryId } from '../state/concepts'

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')

interface Props {
  nodeId: string | null
  onClose: () => void
  onLit?: (nodeId: string) => void // 新点亮时通知场景放特效
}

function relTime(ts: number): string {
  const d = Date.now() - ts
  if (d < 60_000) return '刚刚'
  if (d < 3_600_000) return `${Math.floor(d / 60_000)} 分钟前`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)} 小时前`
  const date = new Date(ts)
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

export function NodeDetail({ nodeId, onClose, onLit }: Props) {
  const nodes = useStore((s) => s.nodes)
  const insights = useStore((s) => s.insights)
  const addInsight = useStore((s) => s.addInsight)

  const node = nodes.find((n) => n.id === nodeId) || null
  const mine = useMemo(
    () =>
      insights
        .filter((i) => i.nodeId === nodeId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [insights, nodeId],
  )

  const [text, setText] = useState('')
  const [mood, setMood] = useState<Mood>('平静')

  if (!node) return null

  const level = levelFromInsights(mine)
  const meta = LEVEL_META[level]
  const cat = CATEGORIES[node.category as CategoryId] ?? CATEGORIES.mind
  const accent = hex(cat.color)
  const wasUnlit = mine.length === 0

  function submit() {
    const t = text.trim()
    if (!t || !node) return
    addInsight(node.id, t, mood)
    setText('')
    if (wasUnlit) onLit?.(node.id)
  }

  return (
    <>
      {/* 轻遮罩，点击关闭，不夺走星海的存在感 */}
      <div
        className="fixed inset-0 z-20 bg-black/30 anim-fade"
        onClick={onClose}
      />
      <aside
        className="glass anim-rise fixed z-30 flex flex-col
          inset-x-0 bottom-0 max-h-[82vh] rounded-t-[28px]
          sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[420px] sm:max-h-none sm:rounded-t-none sm:rounded-l-[28px]"
        style={{ borderColor: 'var(--line)' }}
      >
        {/* 顶部：标题区 */}
        <header className="px-7 pt-7 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="mb-1 text-[11px] uppercase tracking-[0.32em]"
                style={{ color: 'var(--ink-faint)' }}
              >
                {cat.name} · {meta.label}
              </p>
              <h2
                className="leading-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(40px, 9vw, 56px)',
                  color: 'var(--ink)',
                  textShadow: `0 0 38px ${accent}`,
                }}
              >
                {node.label}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="-mr-1 grid h-9 w-9 place-items-center rounded-full text-lg transition hover:bg-white/10"
              style={{ color: 'var(--ink-soft)' }}
              aria-label="关闭"
            >
              ✕
            </button>
          </div>

          <p className="mt-4 text-sm" style={{ color: 'var(--ink-soft)' }}>
            <span style={{ color: accent }}>
              今天有 {lightCountToday(node.id)} 人
            </span>{' '}
            也点亮了这里
          </p>
        </header>

        {/* 写下感悟 */}
        <div className="px-7">
          <div className="mb-3 flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className="rounded-full px-3 py-1 text-[13px] transition"
                style={
                  mood === m
                    ? {
                        background: 'rgba(255,255,255,0.12)',
                        color: 'var(--ink)',
                        boxShadow: `inset 0 0 0 1px ${accent}`,
                      }
                    : { color: 'var(--ink-faint)' }
                }
              >
                {m}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`此刻，你对「${node.label}」懂得了什么？`}
            rows={3}
            className="w-full resize-none rounded-2xl bg-black/25 px-4 py-3 text-[15px] leading-relaxed outline-none transition placeholder:opacity-40 focus:bg-black/35"
            style={{
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              fontFamily: 'var(--font-serif)',
            }}
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="mt-3 w-full rounded-2xl py-3 text-[15px] font-medium tracking-wide transition disabled:opacity-30"
            style={{
              background: text.trim() ? accent : 'rgba(255,255,255,0.06)',
              color: text.trim() ? '#0a0d16' : 'var(--ink-faint)',
              boxShadow: text.trim() ? `0 8px 30px -8px ${accent}` : 'none',
            }}
          >
            {wasUnlit ? '点亮这颗星' : '写下这一刻'}
          </button>
        </div>

        {/* 我的记录 */}
        <div className="mt-6 flex-1 overflow-y-auto px-7 pb-8">
          {mine.length === 0 ? (
            <p
              className="py-6 text-center text-sm italic"
              style={{ color: 'var(--ink-faint)' }}
            >
              还未点亮 · 写下第一笔，让它发光
            </p>
          ) : (
            <ul className="space-y-3">
              {mine.map((i) => (
                <li
                  key={i.id}
                  className="rounded-2xl bg-white/[0.03] p-4"
                  style={{ border: '1px solid var(--line)' }}
                >
                  <div
                    className="mb-1.5 flex items-center gap-2 text-[11px]"
                    style={{ color: 'var(--ink-faint)' }}
                  >
                    <span style={{ color: accent }}>{i.mood}</span>
                    <span>·</span>
                    <span>{relTime(i.createdAt)}</span>
                  </div>
                  <p
                    className="text-[15px] leading-relaxed"
                    style={{ color: 'var(--ink)' }}
                  >
                    {i.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
