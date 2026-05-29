import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// base 按部署目标切换：
//   - 默认 '/'         —— 用于 EdgeOne Pages / 任意根域名（国内主用）
//   - DEPLOY_BASE=/soulmap/ —— 用于 GitHub Pages 子路径（海外备份，由 deploy.sh 注入）
// PWA manifest 图标用相对路径、start_url/scope 用 '.'，两种 base 都不会 404。
const base = process.env.DEPLOY_BASE || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '心屿 · SoulMap',
        short_name: '心屿',
        description: '把你突然懂了的道理，点亮成一片星海。',
        lang: 'zh-CN',
        theme_color: '#05070d',
        background_color: '#04060c',
        display: 'standalone',
        orientation: 'portrait',
        // 相对路径：随 manifest 所在的 /soulmap/ 目录解析，子路径部署不会 404
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
      },
      // 开发不启用 service worker，避免缓存干扰热更新；生产构建/preview 才生效
      devOptions: { enabled: false },
    }),
  ],
})
