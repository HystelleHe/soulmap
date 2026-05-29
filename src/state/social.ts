// 伪随机社交证明（v1 不接真实社交）：
// "今天有 N 人也点亮了这里" —— 同一节点同一天内数字稳定，跨天自然变化。

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 返回某节点今天的"同频人数"，范围约 30–460，按天稳定 */
export function lightCountToday(nodeId: string): number {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const h = hashStr(nodeId + '@' + today)
  return 30 + (h % 431)
}
