import { useState } from 'react'

interface Props {
  onEnter: () => void
}

// 入口页：简介产品 + 一个"进入星海"按钮。进入时整页淡出、轻微推进，过渡到地图。
export function Landing({ onEnter }: Props) {
  const [leaving, setLeaving] = useState(false)

  function enter() {
    if (leaving) return
    setLeaving(true)
    setTimeout(onEnter, 720)
  }

  // 母题用的小星座（点 + 连线），与地图呼应
  const dots = [
    { x: 120, y: 70 }, { x: 250, y: 40 }, { x: 360, y: 120 },
    { x: 210, y: 170 }, { x: 90, y: 200 }, { x: 330, y: 230 }, { x: 200, y: 280 },
  ]
  const links: [number, number][] = [
    [0, 1], [1, 2], [0, 3], [3, 1], [3, 6], [4, 3], [2, 5], [5, 6],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-7 transition-all duration-700"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.06)' : 'scale(1)',
        background:
          'radial-gradient(130% 100% at 50% 30%, rgba(60,96,170,0.18), transparent 55%), radial-gradient(120% 120% at 50% 60%, #070b16 0%, #04060c 75%)',
      }}
    >
      {/* 背景星座母题（淡） */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%]"
        width="460"
        height="320"
        viewBox="0 0 460 320"
        style={{ opacity: 0.5 }}
      >
        {links.map(([a, b], i) => (
          <line
            key={i}
            x1={dots[a].x + 30}
            y1={dots[a].y + 20}
            x2={dots[b].x + 30}
            y2={dots[b].y + 20}
            stroke="rgba(150,180,230,0.35)"
            strokeWidth="1"
          />
        ))}
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x + 30}
            cy={d.y + 20}
            r={i % 3 === 0 ? 3.4 : 2.2}
            fill={i % 4 === 0 ? '#ffce8a' : i % 4 === 2 ? '#7fe0ff' : '#dce6f7'}
            style={{
              filter: 'drop-shadow(0 0 6px currentColor)',
              animation: `breathe ${3 + (i % 4)}s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}
      </svg>

      {/* 文案 + 按钮 */}
      <div className="relative flex max-w-[560px] flex-col items-center text-center">
        <p
          className="anim-rise mb-4 text-[12px] tracking-[0.5em]"
          style={{ color: 'var(--ink-faint)', animationDelay: '0.05s' }}
        >
          S O U L M A P
        </p>
        <h1
          className="anim-rise leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(72px, 18vw, 120px)',
            color: 'var(--ink)',
            letterSpacing: '0.06em',
            textShadow: '0 0 60px rgba(127,224,255,0.3)',
            animationDelay: '0.15s',
          }}
        >
          心屿
        </h1>

        <p
          className="anim-rise mt-7 text-[17px] leading-relaxed sm:text-[19px]"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--ink)',
            animationDelay: '0.35s',
          }}
        >
          把你突然懂了的道理，点亮成一片星海。
        </p>

        <p
          className="anim-rise mt-5 text-[14px] leading-loose sm:text-[15px]"
          style={{ color: 'var(--ink-soft)', animationDelay: '0.5s', maxWidth: '30rem' }}
        >
          我们听过无数大道理，却总要亲身经历后才真正懂得。
          <br />
          在心屿，每一次顿悟都会点亮星海里的一颗星——
          <br />
          记得越多、想得越深，你的内心宇宙便越璀璨。
        </p>

        <button
          onClick={enter}
          className="anim-rise group mt-11 rounded-full px-10 py-3.5 text-[16px] tracking-[0.15em] transition-all duration-300 hover:scale-[1.04]"
          style={{
            fontFamily: 'var(--font-serif)',
            background: 'linear-gradient(135deg, #ffce8a, #ffb454)',
            color: '#0a0d16',
            boxShadow: '0 10px 40px -10px rgba(255,196,84,0.6)',
            animationDelay: '0.7s',
          }}
        >
          进入星海
          <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>

        <p
          className="anim-fade mt-6 text-[11px] tracking-[0.2em]"
          style={{ color: 'var(--ink-faint)', animationDelay: '1s' }}
        >
          数据只存在你的设备里 · 隐私优先
        </p>
      </div>
    </div>
  )
}
