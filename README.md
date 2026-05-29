# 心屿 · SoulMap

把"突然懂了一个道理"的顿悟瞬间记录下来，可视化成一张**无限、无边界的星海地图**：
每个道理是散布在星海里的一颗星，写下感悟即点亮它；记得越多、写得越深，光越亮
（微光 → 烛光 → 灯塔 → 恒星）。核心循环 = 记录 → 回顾 → 共鸣。

纯前端、纯本地存储（localStorage），无需后端、无需账号，隐私优先。

**🌐 线上地址（海外备份，GitHub Pages）：https://hystellehe.github.io/soulmap/**
手机浏览器打开后可"添加到主屏幕"，按 PWA 独立 App 运行。
⚠️ 该地址在中国大陆访问不稳定（github.io 常被墙）。大陆访问请用下方 EdgeOne 方案。

### 大陆访问（腾讯云 EdgeOne Pages，免备案默认域名）
EdgeOne Pages 连接本仓库自动构建，给一个 `*.edgeone.app` 域名，国内不被墙。
连接时构建参数：
- 构建命令：`npm run build`（默认 base=`/`，根路径，正好匹配 EdgeOne 根域名）
- 输出目录：`dist`
- 框架预设：Vite

> 部署目标决定 base：EdgeOne/根域名用默认 `/`；GitHub Pages 子路径由 `deploy.sh`
> 注入 `DEPLOY_BASE=/soulmap/`。两平台并存、互不影响。

## 启动命令

```bash
npm install     # 安装依赖（首次）
npm run dev      # 本地开发，默认 http://localhost:5173/soulmap/
npm run build    # 生产构建，产物在 dist/
npm run preview  # 本地预览生产构建（http://localhost:4173/soulmap/）
```

> 注意：因部署在 `hystellehe.github.io/soulmap/` 子路径下，`vite.config.ts` 里设了
> `base: '/soulmap/'`，所以本地地址也带 `/soulmap/` 后缀。

## 重新部署（改完代码后更新线上）

```bash
./deploy.sh      # 一键：构建 → 推送 gh-pages 分支 → 约 1 分钟后线上生效
```

`deploy.sh` 做的事：本地 `npm run build` 出 `dist/`，把它作为 `gh-pages` 分支根目录
强制推到 GitHub；仓库的 Pages 已设为"从 `gh-pages` 分支根目录发布"。`main` 分支放源码、
`gh-pages` 分支放构建产物，两者互不干扰。

## 技术栈

| 部分 | 选型 |
|---|---|
| 框架 | React 19 + Vite + TypeScript |
| 样式 | Tailwind CSS v4（`@tailwindcss/vite`） |
| 无限地图渲染 | PixiJS v8（WebGL） + `pixi-viewport`（无限相机） |
| 布局 | `d3-force` 力导向（概念星图，Obsidian graph 风格） |
| 状态/持久化 | Zustand + persist 中间件 → localStorage |
| 上线形态 | PWA 网页 App（Phase 7 接入），后续可用 Capacitor 壳成原生 App |

## 目录结构

```
src/
  App.tsx              应用外壳：字标、进度、提示、详情抽屉联动
  main.tsx             入口
  index.css            设计令牌 + 深空底色 + 玻璃面板 + 动效
  state/               纯逻辑层（不依赖 Pixi/React）
    types.ts           数据模型：SoulNode / Insight / Voyage / Mood
    presets.ts         预设"基础道理"词库（星海骨架）
    concepts.ts        主题分类(色簇) + 词→分类 + 隐含关系网(暗线)
    brightness.ts      亮度模型 brightness = f(条数, 字数)
    social.ts          伪随机社交证明（"今天有 N 人也点亮了这里"）
    shareCard.ts       Canvas 2D 生成极简分享卡片 PNG
    store.ts           Zustand store + localStorage 持久化
  map/
    MapCanvas.tsx      React ↔ Pixi 桥接：订阅 store，组装节点+连线喂给场景
    pixi/
      scene.ts         MapScene：相机 + 星空 + 连线网 + 节点 + hover高亮 + 特效
      forceLayout.ts   d3-force 力导向布局（互斥/连线拉拢/防重叠/聚心）
      starfield.ts     多层视差星空（无限平铺）
      nodeSprite.ts    单颗星辰：光晕 + 光环 + 内核 + 标签（按连接数/分类变化）
      layout.ts        初始落点（黄金角螺旋，给力导向当起点）
      glow.ts          发光/内核纹理生成
      theme.ts         分类色簇 + 连线配色
  ui/
    Landing.tsx        入口页：产品简介 + "进入星海"按钮
    NodeDetail.tsx     节点详情抽屉：写感悟 + 心情标签 + 我的记录 + 伪随机社交
    JourneyList.tsx    我的旅程：全部感悟按时间倒序回顾
    Terra.tsx          疆土拓展：新建自定义道理节点
    VoyageCreator.tsx  航程连线：选两星 + 写心路
    Summary.tsx        旅程总结：统计 + 最亮道理 + 心绪分布 + 热力 + 导出卡片
  App.tsx              外壳：入口页 + 工具栏 + 各面板编排
```

## 数据存在哪

全部存在浏览器的 `localStorage`，key 为 `soulmap-v1`，内含 `nodes / insights / voyages`。
清空浏览器数据 = 清空地图。**没有服务器，换设备/浏览器不同步**（云同步是二期计划）。

## 脱离 Claude 怎么维护（PM 视角速查）

- **改预设道理词库**：编辑 `src/state/presets.ts` 的 `PRESET_WORDS` 数组即可，布点会自动重排。
  > 注意：已点亮的记录是按节点 id（`p_0`、`p_1`…按数组顺序）绑定的，
  > 中间插入/删除词会让旧记录错位。要安全增改：**只在数组末尾追加新词**。
- **改主题分类/色簇/隐含关系网**：编辑 `src/state/concepts.ts`
  （`CATEGORIES` 配色、`WORD_CATEGORY` 词归类、`RELATIONS` 暗线关系对）。
- **调地图美学**：颜色在 `src/index.css` 的 `@theme`、`src/map/pixi/theme.ts`；
  星辰大小/辉光/亮度等级在 `src/state/brightness.ts` 的 `LEVEL_META`；
  力导向松紧（斥力/连线距离/聚心）在 `src/map/pixi/forceLayout.ts`；
  初始缩放/阻尼/连线亮度在 `src/map/pixi/scene.ts`。
- **调点亮等级阈值**：`src/state/brightness.ts` 的 `levelFromInsights()`。
- **本地跑起来**：`npm install && npm run dev`，浏览器开 `http://localhost:5173`。
- **部署**：`npm run build` 后把 `dist/` 传到任意静态托管（Vercel / Cloudflare Pages，免费）。

## 安装到手机（PWA）

已接入 `vite-plugin-pwa`：生产版自带 manifest + service worker，可"添加到主屏"、
全屏独立运行、离线可开。

- 本地验证：`npm run build && npm run preview` → 开 `http://localhost:4173`
  （PWA 仅在生产构建/preview 生效，开发模式 `npm run dev` 不启用 service worker）。
- 手机上：用浏览器打开站点 → 分享菜单 →「添加到主屏幕」。
- 换图标：替换 `public/` 下的 `pwa-192x192.png` / `pwa-512x512.png` /
  `maskable-512x512.png` / `apple-touch-icon.png`。
- 部署：`npm run build` 后把 `dist/` 传到任意静态托管（Vercel / Cloudflare Pages，免费）。

## 路线图

- ✅ Phase 0–7：地图、记录、旅程、疆土拓展、航程连线、总结分享卡片、入口页、PWA
- ⬜ 部署到公网（按需，纯静态托管即可）
- 🔮 二期：真实社交/共鸣广场、AI 催化剂追问、云同步、Capacitor 上架
