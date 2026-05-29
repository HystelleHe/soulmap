import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (label: string) => void
}

// 疆土拓展：当领悟到地图上没有的道理，新建一颗自定义星辰
export function Terra({ open, onClose, onCreate }: Props) {
  const [label, setLabel] = useState('')
  if (!open) return null

  function submit() {
    const t = label.trim()
    if (!t) return
    onCreate(t)
    setLabel('')
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/45 anim-fade" onClick={onClose} />
      <div className="fixed inset-0 z-40 grid place-items-center p-6">
        <div
          className="glass anim-rise w-full max-w-[400px] rounded-[26px] p-7"
          onClick={(e) => e.stopPropagation()}
        >
          <p
            className="mb-1 text-[11px] uppercase tracking-[0.32em]"
            style={{ color: 'var(--ink-faint)' }}
          >
            TERRA INCOGNITA · 疆土拓展
          </p>
          <h2
            className="mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '30px',
              color: 'var(--ink)',
            }}
          >
            命名一片新大陆
          </h2>
          <p className="mb-5 text-[13px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            当你领悟到地图上还没有的道理，把它写下来，
            一颗属于你的<span style={{ color: 'var(--color-aurora)' }}>极光之星</span>会在星海边缘亮起。
          </p>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="如：边界感、松弛、长期主义……"
            autoFocus
            maxLength={8}
            className="w-full rounded-2xl bg-black/25 px-4 py-3 text-[16px] outline-none transition placeholder:opacity-40 focus:bg-black/35"
            style={{
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              fontFamily: 'var(--font-serif)',
            }}
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl py-3 text-[15px] transition hover:bg-white/5"
              style={{ color: 'var(--ink-soft)', border: '1px solid var(--line)' }}
            >
              取消
            </button>
            <button
              onClick={submit}
              disabled={!label.trim()}
              className="flex-1 rounded-2xl py-3 text-[15px] font-medium transition disabled:opacity-30"
              style={{
                background: label.trim() ? 'var(--color-aurora)' : 'rgba(255,255,255,0.06)',
                color: label.trim() ? '#0a0d16' : 'var(--ink-faint)',
              }}
            >
              点亮新星
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
