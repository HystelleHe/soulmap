// 用 Canvas 2D 生成一张极简分享卡片（竖版 1080×1350），导出 PNG。
// 不依赖第三方库；绘制前等字体就绪。

export interface CardData {
  label: string
  text: string
  mood: string
  dateText: string
  litCount: number
  accent: string // hex 颜色，如 '#ffc06a'
}

// 按字符宽度换行（中英文混排够用）
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    if (ch === '\n') {
      lines.push(line)
      line = ''
      continue
    }
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line += ch
    }
  }
  if (line) lines.push(line)
  return lines
}

export async function downloadShareCard(d: CardData) {
  // 等字体加载，确保卡片用到的衬线字体生效
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {
      /* ignore */
    }
  }

  const W = 1080
  const H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 深空背景
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#070b16')
  bg.addColorStop(1, '#04060c')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 星云光晕
  const neb = ctx.createRadialGradient(W * 0.5, H * 0.32, 0, W * 0.5, H * 0.32, W * 0.7)
  neb.addColorStop(0, hexA(d.accent, 0.16))
  neb.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = neb
  ctx.fillRect(0, 0, W, H)

  // 随机星点
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const r = Math.random() * 1.6 + 0.3
    ctx.globalAlpha = Math.random() * 0.6 + 0.2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const cx = W / 2

  // 顶部字标
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(199,210,232,0.7)'
  ctx.font = '300 30px "Noto Serif SC", serif'
  ctx.fillText('心屿 · S O U L M A P', cx, 130)

  // 发光的道理之星
  const starY = 300
  const glow = ctx.createRadialGradient(cx, starY, 0, cx, starY, 120)
  glow.addColorStop(0, hexA(d.accent, 0.95))
  glow.addColorStop(0.5, hexA(d.accent, 0.25))
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(cx - 130, starY - 130, 260, 260)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(cx, starY, 9, 0, Math.PI * 2)
  ctx.fill()

  // 道理名
  ctx.fillStyle = '#f2f5fb'
  ctx.font = '500 96px "Noto Serif SC", serif'
  ctx.fillText(d.label, cx, starY + 200)

  // 感悟正文（居中换行）
  ctx.fillStyle = 'rgba(225,232,246,0.92)'
  ctx.font = '300 44px "Noto Serif SC", serif'
  const lines = wrapText(ctx, d.text, W - 220).slice(0, 6)
  let ty = starY + 330
  for (const ln of lines) {
    ctx.fillText(ln, cx, ty)
    ty += 70
  }

  // 心绪 + 日期
  ctx.fillStyle = hexA(d.accent, 0.85)
  ctx.font = '300 32px "Noto Serif SC", serif'
  ctx.fillText(`${d.mood} · ${d.dateText}`, cx, ty + 40)

  // 底部统计
  ctx.fillStyle = 'rgba(159,176,203,0.7)'
  ctx.font = '300 30px "Noto Serif SC", serif'
  ctx.fillText(`已在心屿点亮 ${d.litCount} 座道理`, cx, H - 90)

  // 下载
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `心屿-${d.label}.png`
  a.click()
}

// '#rrggbb' + alpha → rgba()
function hexA(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r},${g},${b},${a})`
}
