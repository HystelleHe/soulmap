import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Insight, Mood, SoulNode, Voyage } from './types'
import { PRESET_WORDS } from './presets'
import { WORD_CATEGORY } from './concepts'
import { spiralPosition, outerPosition } from '../map/pixi/layout'

const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

interface SoulState {
  nodes: SoulNode[]
  insights: Insight[]
  voyages: Voyage[]

  /** 首次进入时播种预设星辰（已有则跳过） */
  ensureSeeded: () => void
  /** 写下一条感悟（即点亮该节点） */
  addInsight: (nodeId: string, text: string, mood: Mood) => void
  /** 疆土拓展：新建一颗自定义星辰，返回它 */
  addCustomNode: (label: string) => SoulNode
  /** 航程连线 */
  addVoyage: (fromId: string, toId: string, note: string) => void
  /** 取某节点的全部感悟（按时间倒序） */
  insightsOf: (nodeId: string) => Insight[]
}

export const useStore = create<SoulState>()(
  persist(
    (set, get) => ({
      nodes: [],
      insights: [],
      voyages: [],

      ensureSeeded: () => {
        if (get().nodes.some((n) => n.type === 'preset')) return
        const now = Date.now()
        const seeded: SoulNode[] = PRESET_WORDS.map((label, i) => {
          const { x, y } = spiralPosition(i)
          return {
            id: 'p_' + i,
            label,
            type: 'preset',
            category: WORD_CATEGORY[label] ?? 'mind',
            x,
            y,
            createdAt: now,
          }
        })
        set((s) => ({ nodes: [...seeded, ...s.nodes] }))
      },

      addInsight: (nodeId, text, mood) => {
        const insight: Insight = {
          id: uid(),
          nodeId,
          text: text.trim(),
          mood,
          createdAt: Date.now(),
        }
        set((s) => ({ insights: [...s.insights, insight] }))
      },

      addCustomNode: (label) => {
        const customCount = get().nodes.filter((n) => n.type === 'custom').length
        const { x, y } = outerPosition(PRESET_WORDS.length + customCount)
        const node: SoulNode = {
          id: 'c_' + uid(),
          label: label.trim(),
          type: 'custom',
          category: 'explore',
          x,
          y,
          createdAt: Date.now(),
        }
        set((s) => ({ nodes: [...s.nodes, node] }))
        return node
      },

      addVoyage: (fromId, toId, note) => {
        const voyage: Voyage = {
          id: uid(),
          fromId,
          toId,
          note: note.trim(),
          createdAt: Date.now(),
        }
        set((s) => ({ voyages: [...s.voyages, voyage] }))
      },

      insightsOf: (nodeId) =>
        get()
          .insights.filter((i) => i.nodeId === nodeId)
          .sort((a, b) => b.createdAt - a.createdAt),
    }),
    {
      name: 'soulmap-v1', // localStorage key（隐私优先：纯本地存储）
      partialize: (s) => ({
        nodes: s.nodes,
        insights: s.insights,
        voyages: s.voyages,
      }),
    },
  ),
)
