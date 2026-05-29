import { useState, useEffect } from 'react'

interface Props {
  active: boolean
  fromLabel: string | null
  toLabel: string | null
  onCancel: () => void
  onSubmit: (note: string) => void
}

// 航程连线：引导用户选两颗星，再写下「因为懂了 A 所以懂了 B」的心路
export function VoyageCreator({ active, fromLabel, toLabel, onCancel, onSubmit }: Props) {
  const [note, setNote] = useState('')
  useEffect(() => {
    if (!active) setNote('')
  }, [active])

  if (!active) return null

  const bothPicked = fromLabel && toLabel

  return (
    <>
      {/* 顶部引导条 */}
      <div className="anim-fade pointer-events-none fixed left-1/2 top-6 z-40 -translate-x-1/2">
        <div
          className="glass pointer-events-auto flex items-center gap-3 rounded-full px-5 py-2.5 text-[13px]"
          style={{ color: 'var(--ink)' }}
        >
          <span style={{ color: 'var(--color-amber-glow)' }}>航程</span>
          <span style={{ color: 'var(--ink-soft)' }}>
            {!fromLabel
              ? '轻触起点星辰'
              : !toLabel
                ? `起点「${fromLabel}」· 再轻触终点星辰`
                : `「${fromLabel}」→「${toLabel}」`}
          </span>
          <button
            onClick={onCancel}
            className="ml-1 rounded-full px-2 py-0.5 text-[12px] transition hover:bg-white/10"
            style={{ color: 'var(--ink-faint)' }}
          >
            取消
          </button>
        </div>
      </div>

      {/* 两端选定后：写心路 */}
      {bothPicked && (
        <>
          <div className="fixed inset-0 z-40 bg-black/45 anim-fade" onClick={onCancel} />
          <div className="fixed inset-0 z-40 grid place-items-center p-6">
            <div
              className="glass anim-rise w-full max-w-[420px] rounded-[26px] p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '26px',
                  color: 'var(--ink)',
                }}
              >
                <span style={{ color: 'var(--color-amber-glow)' }}>{fromLabel}</span>
                <span style={{ color: 'var(--ink-faint)' }}> → </span>
                <span style={{ color: 'var(--color-amber-glow)' }}>{toLabel}</span>
              </h2>
              <p className="mb-4 text-[13px]" style={{ color: 'var(--ink-soft)' }}>
                这两个道理之间，你走过怎样的心路？
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={`我发现，当我懂得「${fromLabel}」，也就慢慢懂了「${toLabel}」……`}
                rows={3}
                autoFocus
                className="w-full resize-none rounded-2xl bg-black/25 px-4 py-3 text-[15px] leading-relaxed outline-none transition placeholder:opacity-40 focus:bg-black/35"
                style={{
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  fontFamily: 'var(--font-serif)',
                }}
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-2xl py-3 text-[15px] transition hover:bg-white/5"
                  style={{ color: 'var(--ink-soft)', border: '1px solid var(--line)' }}
                >
                  取消
                </button>
                <button
                  onClick={() => note.trim() && onSubmit(note)}
                  disabled={!note.trim()}
                  className="flex-1 rounded-2xl py-3 text-[15px] font-medium transition disabled:opacity-30"
                  style={{
                    background: note.trim() ? 'var(--color-amber-glow)' : 'rgba(255,255,255,0.06)',
                    color: note.trim() ? '#0a0d16' : 'var(--ink-faint)',
                  }}
                >
                  连成航线
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
